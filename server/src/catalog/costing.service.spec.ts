import { Prisma } from '@prisma/client';
import { CostingService } from './costing.service';
import type { PrismaService } from '../prisma/prisma.service';

describe('CostingService', () => {
  it('suma cantidad × costo unitario de cada insumo de la receta', async () => {
    const prisma = {
      receta: {
        findMany: jest.fn().mockResolvedValue([
          // 18 g de café a 0.05/g = 0.90
          { cantidad: new Prisma.Decimal(18), insumo: { costoUnitario: new Prisma.Decimal(0.05) } },
          // 200 ml de leche a 0.004/ml = 0.80
          { cantidad: new Prisma.Decimal(200), insumo: { costoUnitario: new Prisma.Decimal(0.004) } },
        ]),
      },
    } as unknown as PrismaService;

    const service = new CostingService(prisma);
    const costo = await service.computeVarianteCost('v1');

    expect(costo.toNumber()).toBeCloseTo(1.7, 4);
  });

  it('devuelve 0 cuando no hay receta', async () => {
    const prisma = {
      receta: { findMany: jest.fn().mockResolvedValue([]) },
    } as unknown as PrismaService;

    const service = new CostingService(prisma);
    const costo = await service.computeVarianteCost('v1');
    expect(costo.toNumber()).toBe(0);
  });
});
