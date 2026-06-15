import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StockService, type StockMovementInput } from '../inventory/stock.service';
import { CreateRefundDto } from './dto/refund.dto';
import { refundAmount } from './refund-rules';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

@Injectable()
export class RefundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
  ) {}

  listByPedido(pedidoId: string) {
    return this.prisma.devolucion.findMany({
      where: { pedidoId },
      include: { detalles: true },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Devolución total o parcial de un pedido pagado. Reincorpora stock (opcional),
   * revierte puntos de fidelización y registra un pago negativo atribuido al
   * turno abierto. Ver docs/08 §8.9. Requiere motivo y permiso sales:refund.
   */
  async devolver(pedidoId: string, dto: CreateRefundDto, usuarioId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        pagos: true,
        movPuntos: true,
        detalles: { include: { modificadores: true, variante: { include: { receta: true } } } },
        devoluciones: { include: { detalles: true } },
      },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado === 'cancelado') throw new BadRequestException('El pedido está cancelado');
    if (pedido.pagos.length === 0) throw new BadRequestException('El pedido no tiene pagos que devolver');

    // Cantidades ya devueltas por línea.
    const yaDevuelto = new Map<string, number>();
    for (const dev of pedido.devoluciones) {
      for (const d of dev.detalles) {
        yaDevuelto.set(d.detallePedidoId, (yaDevuelto.get(d.detallePedidoId) ?? 0) + d.cantidad);
      }
    }
    const detalleMap = new Map(pedido.detalles.map((d) => [d.id, d]));

    // Resolver líneas a devolver: las indicadas o todas las restantes (total).
    const solicitadas = dto.items?.length
      ? dto.items
      : pedido.detalles
          .map((d) => ({ detallePedidoId: d.id, cantidad: d.cantidad - (yaDevuelto.get(d.id) ?? 0) }))
          .filter((x) => x.cantidad > 0);

    if (solicitadas.length === 0) throw new BadRequestException('No hay nada por devolver');

    // Validar y acumular monto + deltas de stock + modificadores involucrados.
    const modIds = new Set<string>();
    let monto = D(0);
    for (const item of solicitadas) {
      const detalle = detalleMap.get(item.detallePedidoId);
      if (!detalle) throw new BadRequestException(`Línea ${item.detallePedidoId} no pertenece al pedido`);
      const restante = detalle.cantidad - (yaDevuelto.get(detalle.id) ?? 0);
      if (item.cantidad > restante) {
        throw new BadRequestException(`No se puede devolver ${item.cantidad}; quedan ${restante}`);
      }
      monto = monto.add(detalle.precioUnit.mul(item.cantidad));
      detalle.modificadores.forEach((m) => modIds.add(m.modificadorId));
    }

    // Prorratea por el descuento a nivel de pedido (función pura).
    monto = refundAmount(monto, pedido.subtotal, pedido.total);

    const modMap = new Map(
      (await this.prisma.modificador.findMany({ where: { id: { in: [...modIds] } } })).map((m) => [m.id, m]),
    );

    // Deltas de reincorporación de stock (positivos) por insumo.
    const stockDeltas = new Map<string, Prisma.Decimal>();
    if (dto.reincorporarStock) {
      const add = (insumoId: string, qty: Prisma.Decimal) =>
        stockDeltas.set(insumoId, (stockDeltas.get(insumoId) ?? D(0)).add(qty));
      for (const item of solicitadas) {
        const detalle = detalleMap.get(item.detallePedidoId)!;
        const cant = D(item.cantidad);
        for (const r of detalle.variante.receta) add(r.insumoId, r.cantidad.mul(cant));
        for (const dm of detalle.modificadores) {
          const mod = modMap.get(dm.modificadorId);
          if (mod?.insumoId && mod.cantidadInsumo) add(mod.insumoId, mod.cantidadInsumo.mul(cant));
        }
      }
    }

    // Puntos a revertir (proporcional al monto, sin exceder el saldo ganado neto).
    let puntosARevertir = 0;
    if (pedido.clienteId) {
      const netoGanado = pedido.movPuntos.reduce((acc, mp) => acc + mp.puntos, 0); // gana(+) y ajustes(−)
      puntosARevertir = Math.min(Math.floor(monto.toNumber()), Math.max(0, netoGanado));
    }

    // Método del pago negativo: el método del primer pago positivo.
    const metodoOriginal = pedido.pagos.find((p) => p.monto.gt(0))?.metodo ?? 'efectivo';
    const turno = await this.prisma.turno.findFirst({
      where: { localId: pedido.localId, estado: 'abierto' },
      select: { id: true },
    });

    const esTotal =
      solicitadas.every((it) => {
        const det = detalleMap.get(it.detallePedidoId)!;
        return (yaDevuelto.get(det.id) ?? 0) + it.cantidad >= det.cantidad;
      }) && pedido.detalles.every((d) => {
        const sol = solicitadas.find((s) => s.detallePedidoId === d.id);
        return (yaDevuelto.get(d.id) ?? 0) + (sol?.cantidad ?? 0) >= d.cantidad;
      });

    return this.prisma.$transaction(async (tx) => {
      const devolucion = await tx.devolucion.create({
        data: {
          pedidoId,
          usuarioId,
          turnoId: turno?.id ?? null,
          motivo: dto.motivo,
          monto,
          reincorporaStock: !!dto.reincorporarStock,
          total: esTotal,
          detalles: { create: solicitadas.map((s) => ({ detallePedidoId: s.detallePedidoId, cantidad: s.cantidad })) },
        },
        include: { detalles: true },
      });

      // Pago negativo (devolución) atribuido al turno → neto en el reporte Z.
      await tx.pago.create({
        data: {
          pedidoId,
          turnoId: turno?.id ?? null,
          metodo: metodoOriginal,
          monto: monto.negated(),
          estado: 'aprobado',
          referencia: `devolucion:${devolucion.id}`,
        },
      });

      // Reincorporación de stock.
      if (stockDeltas.size > 0) {
        const movs: StockMovementInput[] = [...stockDeltas.entries()].map(([insumoId, delta]) => ({
          localId: pedido.localId,
          insumoId,
          tipo: 'ajuste',
          delta,
          refId: devolucion.id,
        }));
        await this.stock.applyMany(movs, tx);
      }

      // Reversión de puntos.
      if (puntosARevertir > 0 && pedido.clienteId) {
        await tx.movimientoPuntos.create({
          data: { clienteId: pedido.clienteId, pedidoId, tipo: 'ajuste', puntos: -puntosARevertir },
        });
        await tx.fidelizacion.update({
          where: { clienteId: pedido.clienteId },
          data: { puntos: { decrement: puntosARevertir }, actualizadoEn: new Date() },
        });
      }

      // Estado del pedido.
      if (esTotal) {
        await tx.pedido.update({ where: { id: pedidoId }, data: { estado: 'devuelto' } });
      }

      return { devolucion, monto, puntosRevertidos: puntosARevertir, reincorporoStock: stockDeltas.size > 0, total: esTotal };
    });
  }
}
