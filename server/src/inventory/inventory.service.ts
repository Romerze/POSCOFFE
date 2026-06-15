import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CostingService } from '../catalog/costing.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto, SetUmbralesDto, UpdateInsumoDto } from './dto/insumo.dto';
import { AjusteStockDto, CreateMermaDto, CreateReposicionDto } from './dto/movimiento.dto';
import { StockService } from './stock.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockService,
    private readonly costing: CostingService,
  ) {}

  // ── Insumos ─────────────────────────────────────────────────
  listInsumos() {
    return this.prisma.insumo.findMany({ orderBy: { nombre: 'asc' } });
  }

  createInsumo(dto: CreateInsumoDto) {
    return this.prisma.insumo.create({ data: dto });
  }

  /** Al cambiar el costo de un insumo, recostea las variantes afectadas. */
  async updateInsumo(id: string, dto: UpdateInsumoDto) {
    const insumo = await this.prisma.insumo.update({ where: { id }, data: dto });
    if (dto.costoUnitario !== undefined) {
      await this.costing.recalcByInsumo(id);
    }
    return insumo;
  }

  // ── Stock / inventario por local ────────────────────────────
  listInventario(localId: string) {
    return this.prisma.inventario.findMany({
      where: { localId },
      include: { insumo: true },
      orderBy: { insumo: { nombre: 'asc' } },
    });
  }

  async setUmbrales(localId: string, insumoId: string, dto: SetUmbralesDto) {
    return this.prisma.inventario.upsert({
      where: { localId_insumoId: { localId, insumoId } },
      create: { localId, insumoId, ...dto },
      update: dto,
    });
  }

  // ── Movimientos ─────────────────────────────────────────────
  async reposicion(dto: CreateReposicionDto, usuarioId: string) {
    const reposicion = await this.prisma.reposicion.create({
      data: {
        localId: dto.localId,
        insumoId: dto.insumoId,
        proveedorId: dto.proveedorId,
        cantidad: dto.cantidad,
        costo: dto.costo,
        usuarioId,
      },
    });
    await this.stock.applyMovement({
      localId: dto.localId,
      insumoId: dto.insumoId,
      tipo: 'reposicion',
      delta: dto.cantidad,
      refId: reposicion.id,
    });
    await this.evaluarAlerta(dto.localId, dto.insumoId);
    return reposicion;
  }

  async merma(dto: CreateMermaDto, usuarioId: string) {
    const insumo = await this.prisma.insumo.findUnique({ where: { id: dto.insumoId } });
    if (!insumo) throw new NotFoundException('Insumo no encontrado');

    const costo = new Prisma.Decimal(dto.cantidad).mul(insumo.costoUnitario);
    const merma = await this.prisma.merma.create({
      data: {
        localId: dto.localId,
        insumoId: dto.insumoId,
        cantidad: dto.cantidad,
        motivo: dto.motivo,
        costo,
        usuarioId,
      },
    });
    await this.stock.applyMovement({
      localId: dto.localId,
      insumoId: dto.insumoId,
      tipo: 'merma',
      delta: -Math.abs(dto.cantidad),
      refId: merma.id,
    });
    await this.evaluarAlerta(dto.localId, dto.insumoId);
    return merma;
  }

  async ajuste(dto: AjusteStockDto) {
    const inv = await this.stock.applyMovement({
      localId: dto.localId,
      insumoId: dto.insumoId,
      tipo: 'ajuste',
      delta: dto.delta,
    });
    await this.evaluarAlerta(dto.localId, dto.insumoId);
    return inv;
  }

  // ── Alertas ─────────────────────────────────────────────────
  listAlertas(localId: string) {
    return this.prisma.alertaStock.findMany({
      where: { localId, estado: 'abierta' },
      orderBy: { creadaEn: 'desc' },
    });
  }

  /** Abre/cierra una alerta de stock crítico según los umbrales del insumo. */
  async evaluarAlerta(localId: string, insumoId: string) {
    const inv = await this.prisma.inventario.findUnique({
      where: { localId_insumoId: { localId, insumoId } },
    });
    if (!inv) return;

    const critico = inv.stockActual.lte(inv.puntoReorden);
    const abierta = await this.prisma.alertaStock.findFirst({
      where: { localId, insumoId, estado: 'abierta', tipo: 'stock_critico' },
    });

    if (critico && !abierta) {
      await this.prisma.alertaStock.create({
        data: { localId, insumoId, tipo: 'stock_critico', estado: 'abierta' },
      });
    } else if (!critico && abierta) {
      await this.prisma.alertaStock.update({
        where: { id: abierta.id },
        data: { estado: 'resuelta' },
      });
    }
  }
}
