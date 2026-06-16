import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { EVENTS, type OrderPaidPayload } from '../common/events';
import { CreateRetoDto } from './dto/reto.dto';
import { aplicarAvance, calcularRacha } from './gamification-rules';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRetoDto) {
    return this.prisma.reto.create({ data: { ...dto, localId: dto.localId ?? null } });
  }

  list(localId?: string) {
    return this.prisma.reto.findMany({
      where: localId ? { OR: [{ localId }, { localId: null }] } : {},
      orderBy: { nombre: 'asc' },
    });
  }

  /** Vista de gamificación de un cliente: retos con progreso, insignias y racha. */
  async deCliente(clienteId: string) {
    const retos = await this.prisma.reto.findMany({
      where: { activo: true },
      include: { progresos: { where: { clienteId } } },
      orderBy: { nombre: 'asc' },
    });
    const retosView = retos.map((r) => {
      const p = r.progresos[0];
      return {
        retoId: r.id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        tipo: r.tipo,
        objetivo: r.objetivo,
        progreso: p?.progreso ?? 0,
        completados: p?.completados ?? 0,
        recompensaPuntos: r.recompensaPuntos,
        insignia: r.insignia,
      };
    });
    const insignias = retosView
      .filter((r) => r.completados > 0)
      .map((r) => ({ insignia: r.insignia, nombre: r.nombre, veces: r.completados }));

    const pedidos = await this.prisma.pedido.findMany({
      where: { clienteId, estado: { not: 'cancelado' } },
      select: { creadoEn: true },
    });
    const racha = calcularRacha(pedidos.map((p) => p.creadoEn));

    return { retos: retosView, insignias, racha };
  }

  /** Al pagar un pedido con cliente, avanza sus retos activos y otorga puntos. */
  @OnEvent(EVENTS.ORDER_PAID)
  async onOrderPaid(payload: OrderPaidPayload) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: payload.pedidoId },
      select: { localId: true },
    });
    if (!pedido) return;

    const retos = await this.prisma.reto.findMany({
      where: { activo: true, OR: [{ localId: null }, { localId: pedido.localId }] },
    });

    for (const reto of retos) {
      const prog = await this.prisma.retoProgreso.upsert({
        where: { retoId_clienteId: { retoId: reto.id, clienteId: payload.clienteId } },
        create: { retoId: reto.id, clienteId: payload.clienteId },
        update: {},
      });

      const incremento = reto.tipo === 'gasto' ? payload.monto : 1;
      const res = aplicarAvance(
        { progreso: prog.progreso.toNumber(), periodoInicio: prog.periodoInicio, completados: prog.completados },
        { objetivo: reto.objetivo.toNumber(), periodoDias: reto.periodoDias, recompensaPuntos: reto.recompensaPuntos },
        incremento,
      );

      await this.prisma.retoProgreso.update({
        where: { id: prog.id },
        data: {
          progreso: res.state.progreso,
          periodoInicio: res.state.periodoInicio,
          completados: res.state.completados,
          ultimoCompletado: res.vecesCompletadoAhora > 0 ? new Date() : prog.ultimoCompletado,
        },
      });

      if (res.puntosGanados > 0) {
        await this.prisma.movimientoPuntos.create({
          data: { clienteId: payload.clienteId, pedidoId: payload.pedidoId, tipo: 'gana', puntos: res.puntosGanados },
        });
        await this.prisma.fidelizacion.update({
          where: { clienteId: payload.clienteId },
          data: { puntos: { increment: res.puntosGanados }, actualizadoEn: new Date() },
        });
      }
    }
  }
}
