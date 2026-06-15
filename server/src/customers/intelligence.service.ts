import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { segmentar } from './segmentation';

const DAY_MS = 1000 * 60 * 60 * 24;

@Injectable()
export class IntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * "Tu café ideal": recomendaciones por historial (reglas).
   * Devuelve el habitual, los frecuentes y una sugerencia no probada.
   */
  async recomendaciones(clienteId: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    const detalles = await this.prisma.detallePedido.findMany({
      where: { pedido: { clienteId, estado: { not: 'cancelado' } } },
      include: { variante: { include: { producto: true } }, pedido: { select: { localId: true } } },
    });

    const conteo = new Map<string, { nombre: string; veces: number }>();
    let localId: string | null = null;
    for (const d of detalles) {
      localId = d.pedido.localId;
      const nombre = `${d.variante.producto.nombre} ${d.variante.nombre}`;
      const prev = conteo.get(d.varianteId) ?? { nombre, veces: 0 };
      prev.veces += d.cantidad;
      conteo.set(d.varianteId, prev);
    }

    const ranking = [...conteo.entries()]
      .map(([varianteId, v]) => ({ varianteId, ...v }))
      .sort((a, b) => b.veces - a.veces);

    // Sugerencia: una variante del local que el cliente nunca pidió.
    let sugerenciaNueva: { varianteId: string; nombre: string } | null = null;
    if (localId) {
      const probadas = new Set(conteo.keys());
      const candidatas = await this.prisma.variante.findMany({
        where: { producto: { localId, activo: true }, id: { notIn: [...probadas] } },
        include: { producto: true },
        take: 1,
        orderBy: { precio: 'desc' }, // sugerir algo de mayor ticket
      });
      if (candidatas[0]) {
        sugerenciaNueva = {
          varianteId: candidatas[0].id,
          nombre: `${candidatas[0].producto.nombre} ${candidatas[0].nombre}`,
        };
      }
    }

    return {
      habitual: ranking[0] ?? null,
      frecuentes: ranking.slice(0, 3),
      sugerenciaNueva,
    };
  }

  /** Calcula y persiste segmento RFM + VIP de un cliente. */
  async recomputarCliente(clienteId: string) {
    const agg = await this.prisma.pedido.aggregate({
      where: { clienteId, estado: { not: 'cancelado' } },
      _count: true,
      _sum: { total: true },
      _max: { creadoEn: true },
    });
    const frecuencia = agg._count;
    const monto = (agg._sum.total ?? new Prisma.Decimal(0)).toNumber();
    const ultima = agg._max.creadoEn;
    const recenciaDias = ultima ? Math.floor((Date.now() - ultima.getTime()) / DAY_MS) : null;

    const { segmento, esVip } = segmentar({ recenciaDias, frecuencia, monto });
    await this.prisma.cliente.update({ where: { id: clienteId }, data: { segmento, esVip } });
    return { clienteId, frecuencia, monto, recenciaDias, segmento, esVip };
  }

  /** Recalcula la segmentación de todos los clientes. */
  async recomputarTodos() {
    const clientes = await this.prisma.cliente.findMany({ select: { id: true } });
    const resultados = [];
    for (const c of clientes) {
      resultados.push(await this.recomputarCliente(c.id));
    }
    const resumen = resultados.reduce<Record<string, number>>((acc, r) => {
      acc[r.segmento] = (acc[r.segmento] ?? 0) + 1;
      return acc;
    }, {});
    return { total: resultados.length, porSegmento: resumen };
  }
}
