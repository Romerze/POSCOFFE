import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEncuestaDto } from './dto/survey.dto';
import { resumirEncuestas } from './nps';

const DAY_MS = 1000 * 60 * 60 * 24;

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registra la respuesta de encuesta de un pedido (una por pedido). */
  async responder(dto: CreateEncuestaDto) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      select: { id: true, localId: true, clienteId: true },
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');

    const yaRespondida = await this.prisma.encuesta.findUnique({ where: { pedidoId: dto.pedidoId } });
    if (yaRespondida) throw new BadRequestException('Este pedido ya tiene encuesta');

    return this.prisma.encuesta.create({
      data: {
        pedidoId: pedido.id,
        localId: pedido.localId,
        clienteId: pedido.clienteId,
        puntaje: dto.puntaje,
        comentario: dto.comentario,
      },
    });
  }

  /** Panel de experiencia del cliente: NPS, promedio, distribución y comentarios. */
  async panel(localId: string, days = 30) {
    const desde = new Date(Date.now() - days * DAY_MS);
    const encuestas = await this.prisma.encuesta.findMany({
      where: { localId, fecha: { gte: desde } },
      orderBy: { fecha: 'desc' },
    });
    const resumen = resumirEncuestas(encuestas.map((e) => e.puntaje));
    const comentarios = encuestas
      .filter((e) => e.comentario)
      .slice(0, 10)
      .map((e) => ({ puntaje: e.puntaje, comentario: e.comentario, fecha: e.fecha }));
    return { ...resumen, comentarios };
  }
}
