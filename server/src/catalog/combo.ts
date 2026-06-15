import { Prisma } from '@prisma/client';

export interface ComboComponentRecipe {
  cantidad: number; // unidades del componente dentro del combo
  receta: { insumoId: string; cantidad: Prisma.Decimal }[];
}

/**
 * Combina las recetas de los componentes de un combo en una receta agregada
 * insumo → cantidad total. Ver docs/08 §8.4 (un combo descuenta la receta de
 * todos sus componentes).
 */
export function combineRecipes(components: ComboComponentRecipe[]): Map<string, Prisma.Decimal> {
  const total = new Map<string, Prisma.Decimal>();
  for (const comp of components) {
    const factor = new Prisma.Decimal(comp.cantidad);
    for (const item of comp.receta) {
      const add = item.cantidad.mul(factor);
      total.set(item.insumoId, (total.get(item.insumoId) ?? new Prisma.Decimal(0)).add(add));
    }
  }
  return total;
}

/** Costo de un combo = suma de (costo de cada componente × su cantidad). */
export function combineCost(
  components: { cantidad: number; costoCalculado: Prisma.Decimal }[],
): Prisma.Decimal {
  return components.reduce(
    (acc, c) => acc.add(c.costoCalculado.mul(c.cantidad)),
    new Prisma.Decimal(0),
  );
}
