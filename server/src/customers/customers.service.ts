import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EVENTS, type OrderPaidPayload } from '../common/events';
import { CanjearDto, CreateClienteDto } from './dto/cliente.dto';

/** 1 punto por cada unidad monetaria gastada (configurable a futuro). */
const PUNTOS_POR_UNIDAD = 1;

/** Umbrales de nivel por puntos acumulados. */
function nivelPorPuntos(puntos: number): string {
  if (puntos >= 1000) return 'oro';
  if (puntos >= 300) return 'plata';
  return 'base';
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crea el cliente junto con su cuenta de fidelización. */
  createCliente(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: { ...dto, fidelizacion: { create: { puntos: 0, nivel: 'base' } } },
      include: { fidelizacion: true },
    });
  }

  getCliente(id: string) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: { fidelizacion: true },
    });
  }

  async identificar(telefono: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { telefono },
      include: { fidelizacion: true },
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  /** Acredita puntos por una compra. Idempotente por (pedido, tipo gana). */
  async acreditarPuntos(clienteId: string, pedidoId: string, monto: number) {
    const yaAcreditado = await this.prisma.movimientoPuntos.findFirst({
      where: { clienteId, pedidoId, tipo: 'gana' },
    });
    if (yaAcreditado) return;

    const puntos = Math.floor(monto * PUNTOS_POR_UNIDAD);
    if (puntos <= 0) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.movimientoPuntos.create({
        data: { clienteId, pedidoId, tipo: 'gana', puntos },
      });
      const fid = await tx.fidelizacion.update({
        where: { clienteId },
        data: { puntos: { increment: puntos }, actualizadoEn: new Date() },
      });
      const nivel = nivelPorPuntos(fid.puntos);
      if (nivel !== fid.nivel) {
        await tx.fidelizacion.update({ where: { clienteId }, data: { nivel } });
      }
    });
  }

  /** Canjea puntos por una recompensa (descuenta del saldo). */
  async canjear(dto: CanjearDto) {
    const fid = await this.prisma.fidelizacion.findUnique({ where: { clienteId: dto.clienteId } });
    if (!fid) throw new NotFoundException('Cliente sin cuenta de fidelización');
    if (fid.puntos < dto.puntos) throw new BadRequestException('Puntos insuficientes');

    return this.prisma.$transaction(async (tx) => {
      await tx.movimientoPuntos.create({
        data: { clienteId: dto.clienteId, tipo: 'canjea', puntos: -dto.puntos },
      });
      return tx.fidelizacion.update({
        where: { clienteId: dto.clienteId },
        data: { puntos: { decrement: dto.puntos }, actualizadoEn: new Date() },
      });
    });
  }

  /** Acredita puntos automáticamente cuando se paga un pedido con cliente. */
  @OnEvent(EVENTS.ORDER_PAID)
  async onOrderPaid(payload: OrderPaidPayload) {
    await this.acreditarPuntos(payload.clienteId, payload.pedidoId, payload.monto);
  }
}
