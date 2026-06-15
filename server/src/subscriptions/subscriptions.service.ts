import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConsumirDto, CreateSuscripcionDto } from './dto/subscription.dto';
import { puedeConsumir } from './subscription-rules';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Crea una suscripción activa con vigencia inicio→inicio+duracionDias. */
  create(dto: CreateSuscripcionDto) {
    const inicio = new Date();
    const fin = new Date(inicio);
    fin.setDate(fin.getDate() + dto.duracionDias);
    return this.prisma.suscripcion.create({
      data: {
        clienteId: dto.clienteId,
        plan: dto.plan,
        precio: dto.precio,
        limiteConsumos: dto.limiteConsumos ?? null,
        inicio,
        fin,
        estado: 'activa',
      },
    });
  }

  listByCliente(clienteId: string) {
    return this.prisma.suscripcion.findMany({
      where: { clienteId },
      include: { _count: { select: { consumos: true } } },
      orderBy: { inicio: 'desc' },
    });
  }

  /** Suscripción activa y vigente del cliente, si existe. */
  async activaDeCliente(clienteId: string) {
    const now = new Date();
    return this.prisma.suscripcion.findFirst({
      where: { clienteId, estado: 'activa', inicio: { lte: now }, fin: { gte: now } },
      include: { _count: { select: { consumos: true } } },
    });
  }

  cancelar(id: string) {
    return this.prisma.suscripcion.update({ where: { id }, data: { estado: 'cancelada' } });
  }

  /**
   * Consume un pedido contra la suscripción: valida vigencia y límite,
   * registra el consumo y marca el pedido como pagado con método 'suscripcion'
   * (no genera efectivo; el stock ya se descontó al crear el pedido).
   */
  async consumir(suscripcionId: string, dto: ConsumirDto) {
    const sub = await this.prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: { _count: { select: { consumos: true } } },
    });
    if (!sub) throw new NotFoundException('Suscripción no encontrada');

    const check = puedeConsumir({
      estado: sub.estado,
      inicio: sub.inicio,
      fin: sub.fin,
      limiteConsumos: sub.limiteConsumos,
      consumosActuales: sub._count.consumos,
    });
    if (!check.ok) throw new BadRequestException(check.motivo);

    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      include: { pagos: true, consumosSuscripcion: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado === 'cancelado') throw new BadRequestException('Pedido cancelado');
    if (pedido.consumosSuscripcion.length > 0 || pedido.pagos.length > 0) {
      throw new BadRequestException('El pedido ya fue pagado o consumido');
    }

    return this.prisma.$transaction(async (tx) => {
      const consumo = await tx.consumoSuscripcion.create({
        data: { suscripcionId, pedidoId: pedido.id },
      });
      await tx.pago.create({
        data: {
          pedidoId: pedido.id,
          metodo: 'suscripcion',
          monto: pedido.total,
          estado: 'aprobado',
          referencia: suscripcionId,
        },
      });
      return consumo;
    });
  }
}
