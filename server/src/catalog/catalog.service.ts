import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CostingService } from './costing.service';
import { combineCost } from './combo';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/categoria.dto';
import {
  CreateModificadorDto,
  CreateModificadorGrupoDto,
  LinkGrupoProductoDto,
} from './dto/modificador.dto';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { SetRecetaItemDto } from './dto/receta.dto';
import { CreateVarianteDto, UpdateVarianteDto } from './dto/variante.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly costing: CostingService,
  ) {}

  // ── Categorías ──────────────────────────────────────────────
  listCategorias(localId: string) {
    return this.prisma.categoria.findMany({
      where: { localId },
      orderBy: { orden: 'asc' },
    });
  }

  createCategoria(dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({ data: dto });
  }

  updateCategoria(id: string, dto: UpdateCategoriaDto) {
    return this.prisma.categoria.update({ where: { id }, data: dto });
  }

  // ── Productos ───────────────────────────────────────────────
  listProductos(localId: string) {
    return this.prisma.producto.findMany({
      where: { localId },
      include: { variantes: true, categoria: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async getProducto(id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { variantes: true, modGrupos: { include: { grupo: { include: { modificadores: true } } } } },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  createProducto(dto: CreateProductoDto) {
    return this.prisma.producto.create({ data: dto });
  }

  updateProducto(id: string, dto: UpdateProductoDto) {
    return this.prisma.producto.update({ where: { id }, data: dto });
  }

  // ── Variantes ───────────────────────────────────────────────
  createVariante(dto: CreateVarianteDto) {
    return this.prisma.variante.create({ data: dto });
  }

  updateVariante(id: string, dto: UpdateVarianteDto) {
    return this.prisma.variante.update({ where: { id }, data: dto });
  }

  // ── Modificadores ───────────────────────────────────────────
  createModificadorGrupo(dto: CreateModificadorGrupoDto) {
    return this.prisma.modificadorGrupo.create({ data: dto });
  }

  createModificador(dto: CreateModificadorDto) {
    return this.prisma.modificador.create({ data: dto });
  }

  linkGrupoProducto(dto: LinkGrupoProductoDto) {
    return this.prisma.productoModificadorGrupo.create({ data: dto });
  }

  // ── Recetas ─────────────────────────────────────────────────
  async getReceta(varianteId: string) {
    return this.prisma.receta.findMany({
      where: { varianteId },
      include: { insumo: true },
    });
  }

  /** Reemplaza la receta completa de una variante y recalcula su costo. */
  async setReceta(varianteId: string, items: SetRecetaItemDto[]) {
    const variante = await this.prisma.variante.findUnique({ where: { id: varianteId } });
    if (!variante) throw new NotFoundException('Variante no encontrada');

    await this.prisma.$transaction([
      this.prisma.receta.deleteMany({ where: { varianteId } }),
      this.prisma.receta.createMany({
        data: items.map((it) => ({ varianteId, insumoId: it.insumoId, cantidad: it.cantidad })),
      }),
    ]);

    const costo = await this.costing.recalcVariante(varianteId);
    return { varianteId, costoCalculado: costo, items: items.length };
  }

  // ── Combos ──────────────────────────────────────────────────
  getCombo(comboVarianteId: string) {
    return this.prisma.comboComponente.findMany({
      where: { comboVarianteId },
      include: { variante: { include: { producto: true } } },
    });
  }

  /** Define los componentes de un combo y recalcula su costo (suma de componentes). */
  async setComboComponentes(
    comboVarianteId: string,
    items: { varianteId: string; cantidad: number }[],
  ) {
    const combo = await this.prisma.variante.findUnique({ where: { id: comboVarianteId } });
    if (!combo) throw new NotFoundException('Variante de combo no encontrada');

    await this.prisma.$transaction([
      this.prisma.comboComponente.deleteMany({ where: { comboVarianteId } }),
      this.prisma.comboComponente.createMany({
        data: items.map((it) => ({ comboVarianteId, varianteId: it.varianteId, cantidad: it.cantidad })),
      }),
    ]);

    // Recosteo del combo a partir de sus componentes.
    const componentes = await this.prisma.comboComponente.findMany({
      where: { comboVarianteId },
      include: { variante: { select: { costoCalculado: true } } },
    });
    const costo = combineCost(
      componentes.map((c) => ({ cantidad: c.cantidad, costoCalculado: c.variante.costoCalculado })),
    );
    await this.prisma.variante.update({ where: { id: comboVarianteId }, data: { costoCalculado: costo } });

    return { comboVarianteId, costoCalculado: costo, componentes: componentes.length };
  }

  /**
   * Upselling: productos que suelen comprarse junto con esta variante
   * (frequently bought together). Si no hay historial, devuelve top ventas.
   */
  async upsell(varianteId: string, localId: string) {
    const pedidosCon = await this.prisma.detallePedido.findMany({
      where: { varianteId, pedido: { localId, estado: { not: 'cancelado' } } },
      select: { pedidoId: true },
      take: 500,
    });
    const pedidoIds = pedidosCon.map((p) => p.pedidoId);

    let ranking: { varianteId: string; veces: number }[] = [];
    if (pedidoIds.length > 0) {
      const acompanantes = await this.prisma.detallePedido.groupBy({
        by: ['varianteId'],
        where: { pedidoId: { in: pedidoIds }, varianteId: { not: varianteId } },
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 3,
      });
      ranking = acompanantes.map((a) => ({ varianteId: a.varianteId, veces: a._sum.cantidad ?? 0 }));
    }

    if (ranking.length === 0) {
      // Fallback: top ventas del local distintos de la variante.
      const top = await this.prisma.detallePedido.groupBy({
        by: ['varianteId'],
        where: { varianteId: { not: varianteId }, pedido: { localId, estado: { not: 'cancelado' } } },
        _sum: { cantidad: true },
        orderBy: { _sum: { cantidad: 'desc' } },
        take: 3,
      });
      ranking = top.map((a) => ({ varianteId: a.varianteId, veces: a._sum.cantidad ?? 0 }));
    }

    const variantes = await this.prisma.variante.findMany({
      where: { id: { in: ranking.map((r) => r.varianteId) } },
      include: { producto: true },
    });
    const vmap = new Map(variantes.map((v) => [v.id, v]));
    return ranking
      .filter((r) => vmap.has(r.varianteId))
      .map((r) => {
        const v = vmap.get(r.varianteId)!;
        return {
          varianteId: r.varianteId,
          nombre: `${v.producto.nombre} ${v.nombre}`,
          precio: v.precio,
          veces: r.veces,
        };
      });
  }
}
