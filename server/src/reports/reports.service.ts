import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const D = (v: Prisma.Decimal.Value) => new Prisma.Decimal(v);

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysAgo(n: number): Date {
  const x = new Date();
  x.setDate(x.getDate() - n);
  return x;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /** KPIs del día: ventas, nº de pedidos, ticket promedio y productos top. */
  async dashboard(localId: string) {
    const desde = startOfDay();
    const where = { localId, estado: { not: 'cancelado' }, creadoEn: { gte: desde } };

    const agg = await this.prisma.pedido.aggregate({
      where,
      _sum: { total: true },
      _count: true,
    });
    const ventas = agg._sum.total ?? D(0);
    const numPedidos = agg._count;
    const ticketPromedio = numPedidos > 0 ? ventas.div(numPedidos) : D(0);

    const topRaw = await this.prisma.detallePedido.groupBy({
      by: ['varianteId'],
      where: { pedido: where },
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    });
    const variantes = await this.prisma.variante.findMany({
      where: { id: { in: topRaw.map((t) => t.varianteId) } },
      include: { producto: true },
    });
    const vmap = new Map(variantes.map((v) => [v.id, v]));
    const productosTop = topRaw.map((t) => ({
      varianteId: t.varianteId,
      nombre: vmap.get(t.varianteId)
        ? `${vmap.get(t.varianteId)!.producto.nombre} ${vmap.get(t.varianteId)!.nombre}`
        : t.varianteId,
      cantidad: t._sum.cantidad ?? 0,
    }));

    return { fecha: desde, ventas, numPedidos, ticketPromedio, productosTop };
  }

  /** Mapa de calor: ventas por hora del día en los últimos `days` días. */
  async mapaCalor(localId: string, days = 30) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { localId, estado: { not: 'cancelado' }, creadoEn: { gte: daysAgo(days) } },
      select: { creadoEn: true, total: true },
    });
    const horas = Array.from({ length: 24 }, (_, h) => ({ hora: h, cantidad: 0, ventas: D(0) }));
    for (const p of pedidos) {
      const h = new Date(p.creadoEn).getHours();
      horas[h].cantidad += 1;
      horas[h].ventas = horas[h].ventas.add(p.total);
    }
    return horas.filter((h) => h.cantidad > 0);
  }

  /** Predicción de quiebres v1: días restantes = stock / consumo medio diario. */
  async prediccionQuiebres(localId: string, days = 14) {
    const inventario = await this.prisma.inventario.findMany({
      where: { localId },
      include: { insumo: true },
    });
    const consumo = await this.prisma.movimientoStock.groupBy({
      by: ['insumoId'],
      where: { localId, tipo: 'venta', creadoEn: { gte: daysAgo(days) } },
      _sum: { delta: true },
    });
    const consumoMap = new Map(consumo.map((c) => [c.insumoId, c._sum.delta ?? D(0)]));

    return inventario
      .map((inv) => {
        const consumoTotal = (consumoMap.get(inv.insumoId) ?? D(0)).abs();
        const consumoDiario = consumoTotal.div(days);
        const diasRestantes = consumoDiario.gt(0)
          ? inv.stockActual.div(consumoDiario).toNumber()
          : null;
        return {
          insumoId: inv.insumoId,
          nombre: inv.insumo.nombre,
          stockActual: inv.stockActual,
          consumoDiario,
          diasRestantes,
          critico: diasRestantes !== null && diasRestantes <= 3,
        };
      })
      .sort((a, b) => (a.diasRestantes ?? Infinity) - (b.diasRestantes ?? Infinity));
  }

  /** Ranking de personal por ventas en el periodo (operador del pedido). */
  async rankingPersonal(localId: string, days = 30) {
    const grupos = await this.prisma.pedido.groupBy({
      by: ['usuarioId'],
      // Excluye pedidos sin operador (QR/pick-up) del ranking de personal.
      where: { localId, estado: { not: 'cancelado' }, usuarioId: { not: null }, creadoEn: { gte: daysAgo(days) } },
      _count: true,
      _sum: { total: true },
      _avg: { total: true },
      orderBy: { _sum: { total: 'desc' } },
    });
    const ids = grupos.map((g) => g.usuarioId).filter((id): id is string => id !== null);
    const usuarios = await this.prisma.usuario.findMany({
      where: { id: { in: ids } },
      select: { id: true, nombre: true },
    });
    const umap = new Map(usuarios.map((u) => [u.id, u.nombre]));
    return grupos.map((g) => ({
      usuarioId: g.usuarioId,
      nombre: (g.usuarioId && umap.get(g.usuarioId)) || g.usuarioId || '—',
      pedidos: g._count,
      ventas: g._sum.total ?? D(0),
      ticketPromedio: g._avg.total ?? D(0),
    }));
  }

  /** Márgenes por variante: precio − costo por receta. */
  async margenes(localId: string) {
    const variantes = await this.prisma.variante.findMany({
      where: { producto: { localId } },
      include: { producto: true },
    });
    return variantes
      .map((v) => {
        const margen = v.precio.sub(v.costoCalculado);
        const margenPct = v.precio.gt(0) ? margen.div(v.precio).mul(100).toNumber() : 0;
        return {
          varianteId: v.id,
          nombre: `${v.producto.nombre} ${v.nombre}`,
          precio: v.precio,
          costo: v.costoCalculado,
          margen,
          margenPct: Math.round(margenPct * 10) / 10,
        };
      })
      .sort((a, b) => b.margenPct - a.margenPct);
  }
}
