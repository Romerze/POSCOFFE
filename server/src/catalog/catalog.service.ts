import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CostingService } from './costing.service';
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
}
