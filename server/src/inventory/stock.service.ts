import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { StockMovementType } from '@poscoffe/types';
import { PrismaService } from '../prisma/prisma.service';

export interface StockMovementInput {
  localId: string;
  insumoId: string;
  tipo: StockMovementType;
  delta: Prisma.Decimal | number; // negativo descuenta
  refId?: string;
}

/**
 * Núcleo de inventario. Cada cambio de stock es un movimiento append-only
 * (delta); `inventario.stockActual` se mantiene como agregado de esos deltas.
 * Esto hace la sincronización conmutativa entre cajas offline. Ver docs/06 §6.9.
 */
@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  /** Aplica un movimiento y actualiza el stock agregado, en una transacción. */
  async applyMovement(input: StockMovementInput, tx?: Prisma.TransactionClient) {
    const delta = new Prisma.Decimal(input.delta);

    const run = async (db: Prisma.TransactionClient) => {
      await db.movimientoStock.create({
        data: {
          localId: input.localId,
          insumoId: input.insumoId,
          tipo: input.tipo,
          delta,
          refId: input.refId,
        },
      });

      return db.inventario.upsert({
        where: { localId_insumoId: { localId: input.localId, insumoId: input.insumoId } },
        create: {
          localId: input.localId,
          insumoId: input.insumoId,
          stockActual: delta,
        },
        update: { stockActual: { increment: delta } },
      });
    };

    return tx ? run(tx) : this.prisma.$transaction(run);
  }

  /** Aplica varios movimientos atómicamente (usado por una venta). */
  async applyMany(inputs: StockMovementInput[], tx?: Prisma.TransactionClient) {
    const run = async (db: Prisma.TransactionClient) => {
      for (const input of inputs) {
        await this.applyMovement(input, db);
      }
    };
    if (tx) return run(tx);
    return this.prisma.$transaction(run);
  }

  /** Recalcula el stock de un insumo desde sus movimientos (reconciliación). */
  async reconcile(localId: string, insumoId: string) {
    const agg = await this.prisma.movimientoStock.aggregate({
      where: { localId, insumoId },
      _sum: { delta: true },
    });
    const total = agg._sum.delta ?? new Prisma.Decimal(0);
    return this.prisma.inventario.update({
      where: { localId_insumoId: { localId, insumoId } },
      data: { stockActual: total },
    });
  }
}
