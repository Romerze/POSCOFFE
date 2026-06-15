import { Prisma } from '@prisma/client';
import { combineCost, combineRecipes } from './combo';

const D = (n: number) => new Prisma.Decimal(n);

describe('combineRecipes', () => {
  it('agrega recetas de componentes por insumo', () => {
    const r = combineRecipes([
      { cantidad: 1, receta: [{ insumoId: 'cafe', cantidad: D(18) }, { insumoId: 'leche', cantidad: D(200) }] },
      { cantidad: 2, receta: [{ insumoId: 'cafe', cantidad: D(9) }] }, // 2 × 9 = 18
    ]);
    expect(r.get('cafe')!.toNumber()).toBe(36); // 18 + 18
    expect(r.get('leche')!.toNumber()).toBe(200);
  });
});

describe('combineCost', () => {
  it('suma costo × cantidad de cada componente', () => {
    const c = combineCost([
      { cantidad: 1, costoCalculado: D(2) },
      { cantidad: 2, costoCalculado: D(1.5) },
    ]);
    expect(c.toNumber()).toBe(5); // 2 + 3
  });
});
