import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Costeo por receta: el costo de una variante es la suma de
 * (cantidad de cada insumo × su costo unitario). Ver docs/08 §8.4.
 */
@Injectable()
export class CostingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Calcula el costo de una variante a partir de su receta (sin persistir). */
  async computeVarianteCost(varianteId: string): Promise<Prisma.Decimal> {
    const items = await this.prisma.receta.findMany({
      where: { varianteId },
      include: { insumo: true },
    });
    return items.reduce(
      (acc, item) => acc.add(item.cantidad.mul(item.insumo.costoUnitario)),
      new Prisma.Decimal(0),
    );
  }

  /** Recalcula y persiste el costo de una variante. */
  async recalcVariante(varianteId: string): Promise<Prisma.Decimal> {
    const costo = await this.computeVarianteCost(varianteId);
    await this.prisma.variante.update({
      where: { id: varianteId },
      data: { costoCalculado: costo },
    });
    return costo;
  }

  /** Recalcula todas las variantes que usan un insumo (al cambiar su costo). */
  async recalcByInsumo(insumoId: string): Promise<number> {
    const recetas = await this.prisma.receta.findMany({
      where: { insumoId },
      select: { varianteId: true },
      distinct: ['varianteId'],
    });
    for (const { varianteId } of recetas) {
      await this.recalcVariante(varianteId);
    }
    return recetas.length;
  }
}
