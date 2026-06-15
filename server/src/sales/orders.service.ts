import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { StockService, type StockMovementInput } from '../inventory/stock.service';
import { EVENTS, type OrderPaidPayload } from '../common/events';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto, CreatePaymentDto } from './dto/payment.dto';
import { priceOrder } from './order-pricing';

const orderInclude = {
  detalles: { include: { modificadores: true, variante: true } },
  pagos: true,
} satisfies Prisma.PedidoInclude;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly events: EventEmitter2,
  ) {}

  getOrder(id: string) {
    return this.prisma.pedido.findUnique({ where: { id }, include: orderInclude });
  }

  listOrders(localId: string, estado?: string) {
    return this.prisma.pedido.findMany({
      where: { localId, ...(estado ? { estado } : {}) },
      include: orderInclude,
      orderBy: { creadoEn: 'desc' },
      take: 100,
    });
  }

  /**
   * Crea un pedido de forma idempotente (operationId) y descuenta el stock
   * por receta de cada ítem y de sus modificadores. Todo en una transacción.
   */
  async createOrder(dto: CreateOrderDto, usuarioId: string) {
    // Idempotencia: si ya se sincronizó esta operación, devolver el pedido existente.
    const existing = await this.prisma.pedido.findUnique({
      where: { operationId: dto.operationId },
      include: orderInclude,
    });
    if (existing) return existing;

    const varianteIds = dto.items.map((i) => i.varianteId);
    const variantes = await this.prisma.variante.findMany({
      where: { id: { in: varianteIds } },
      include: { receta: true },
    });
    const varMap = new Map(variantes.map((v) => [v.id, v]));

    const modIds = [...new Set(dto.items.flatMap((i) => i.modificadorIds ?? []))];
    const modificadores = modIds.length
      ? await this.prisma.modificador.findMany({ where: { id: { in: modIds } } })
      : [];
    const modMap = new Map(modificadores.map((m) => [m.id, m]));

    // Validar referencias antes de tarificar (mensajes de dominio claros).
    for (const item of dto.items) {
      if (!varMap.has(item.varianteId)) {
        throw new NotFoundException(`Variante ${item.varianteId} no existe`);
      }
      for (const modId of item.modificadorIds ?? []) {
        if (!modMap.has(modId)) throw new NotFoundException(`Modificador ${modId} no existe`);
      }
    }

    // ── Cálculo de líneas, totales y deltas de stock (lógica pura) ──
    const { subtotal, detalles: detallesData, stockDeltas } = priceOrder(dto.items, varMap, modMap);

    const descuento = new Prisma.Decimal(0); // promociones llegan en Fase 2
    const total = subtotal.sub(descuento);

    const movements: StockMovementInput[] = [...stockDeltas.entries()].map(([insumoId, delta]) => ({
      localId: dto.localId,
      insumoId,
      tipo: 'venta' as const,
      delta,
    }));

    const pedidoId = dto.id ?? randomUUID();

    const pedido = await this.prisma.$transaction(async (tx) => {
      const created = await tx.pedido.create({
        data: {
          id: pedidoId,
          operationId: dto.operationId,
          localId: dto.localId,
          clienteId: dto.clienteId,
          usuarioId,
          canal: dto.canal,
          mesa: dto.mesa,
          estado: 'pendiente',
          subtotal,
          descuento,
          total,
          detalles: {
            create: detallesData.map((d) => ({
              varianteId: d.varianteId,
              cantidad: d.cantidad,
              precioUnit: d.precioUnit,
              subtotal: d.subtotal,
              notas: d.notas,
              modificadores: { create: d.modificadores },
            })),
          },
        },
        include: orderInclude,
      });

      // Movimientos de stock con refId = pedido (dentro de la misma transacción).
      const refMovements = movements.map((m) => ({ ...m, refId: created.id }));
      await this.stock.applyMany(refMovements, tx);

      return created;
    });

    // Notifica al KDS (cocina/barista) en tiempo real.
    this.events.emit(EVENTS.ORDER_CREATED, { localId: pedido.localId, order: pedido });
    return pedido;
  }

  async updateEstado(id: string, estado: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    const updated = await this.prisma.pedido.update({
      where: { id },
      data: { estado },
      include: orderInclude,
    });
    this.events.emit(EVENTS.ORDER_UPDATED, { localId: updated.localId, order: updated });
    return updated;
  }

  async addPayment(id: string, dto: CreatePaymentDto) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id }, include: { pagos: true } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado === 'cancelado') throw new BadRequestException('Pedido cancelado');

    const pago = await this.prisma.pago.create({
      data: {
        pedidoId: id,
        metodo: dto.metodo,
        monto: dto.monto,
        propina: dto.propina ?? 0,
        referencia: dto.referencia,
        proveedor: dto.proveedor,
        estado: 'aprobado',
      },
    });

    // Acreditar puntos de fidelización si el pedido tiene cliente.
    if (pedido.clienteId) {
      const payload: OrderPaidPayload = {
        clienteId: pedido.clienteId,
        pedidoId: id,
        monto: dto.monto,
      };
      this.events.emit(EVENTS.ORDER_PAID, payload);
    }
    return pago;
  }

  /** Cancela un pedido y reincorpora el stock descontado por la venta. */
  async cancelOrder(id: string, _dto: CancelOrderDto) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado === 'cancelado') throw new BadRequestException('Ya está cancelado');

    const ventaMovs = await this.prisma.movimientoStock.findMany({
      where: { refId: id, tipo: 'venta' },
    });

    const cancelado = await this.prisma.$transaction(async (tx) => {
      // Revertir cada movimiento de venta con un ajuste de signo opuesto.
      for (const m of ventaMovs) {
        await this.stock.applyMovement(
          {
            localId: m.localId,
            insumoId: m.insumoId,
            tipo: 'ajuste',
            delta: m.delta.negated(),
            refId: id,
          },
          tx,
        );
      }
      return tx.pedido.update({
        where: { id },
        data: { estado: 'cancelado' },
        include: orderInclude,
      });
    });

    this.events.emit(EVENTS.ORDER_UPDATED, { localId: cancelado.localId, order: cancelado });
    return cancelado;
  }
}
