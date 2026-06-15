import { Prisma } from '@prisma/client';

/** Datos mínimos de catálogo necesarios para tarificar una línea. */
export interface VarianteForPricing {
  id: string;
  precio: Prisma.Decimal;
  receta: { insumoId: string; cantidad: Prisma.Decimal }[];
}

export interface ModificadorForPricing {
  id: string;
  precioExtra: Prisma.Decimal;
  insumoId: string | null;
  cantidadInsumo: Prisma.Decimal | null;
}

export interface OrderItemInput {
  varianteId: string;
  cantidad: number;
  notas?: string;
  modificadorIds?: string[];
}

export interface PricedDetalle {
  varianteId: string;
  cantidad: number;
  precioUnit: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  notas?: string;
  modificadores: { modificadorId: string; precioExtra: Prisma.Decimal }[];
}

export interface PricedOrder {
  subtotal: Prisma.Decimal;
  detalles: PricedDetalle[];
  /** insumoId → delta de stock (negativo = descuento). Agregado por insumo. */
  stockDeltas: Map<string, Prisma.Decimal>;
}

/**
 * Función pura: a partir del catálogo y los ítems pedidos, calcula precios de
 * línea, subtotal y los deltas de stock a descontar (receta de la variante +
 * insumos de modificadores). No toca la base de datos. Ver docs/08 §8.1 y §8.4.
 */
export function priceOrder(
  items: OrderItemInput[],
  varMap: Map<string, VarianteForPricing>,
  modMap: Map<string, ModificadorForPricing>,
): PricedOrder {
  const stockDeltas = new Map<string, Prisma.Decimal>();
  const addDelta = (insumoId: string, qty: Prisma.Decimal) => {
    stockDeltas.set(insumoId, (stockDeltas.get(insumoId) ?? new Prisma.Decimal(0)).sub(qty));
  };

  let subtotal = new Prisma.Decimal(0);
  const detalles: PricedDetalle[] = [];

  for (const item of items) {
    const variante = varMap.get(item.varianteId);
    if (!variante) throw new Error(`Variante ${item.varianteId} no existe`);

    const cantidad = new Prisma.Decimal(item.cantidad);
    let precioUnit = variante.precio;

    for (const r of variante.receta) {
      addDelta(r.insumoId, r.cantidad.mul(cantidad));
    }

    const lineMods: { modificadorId: string; precioExtra: Prisma.Decimal }[] = [];
    for (const modId of item.modificadorIds ?? []) {
      const mod = modMap.get(modId);
      if (!mod) throw new Error(`Modificador ${modId} no existe`);
      precioUnit = precioUnit.add(mod.precioExtra);
      lineMods.push({ modificadorId: mod.id, precioExtra: mod.precioExtra });
      if (mod.insumoId && mod.cantidadInsumo) {
        addDelta(mod.insumoId, mod.cantidadInsumo.mul(cantidad));
      }
    }

    const lineSubtotal = precioUnit.mul(cantidad);
    subtotal = subtotal.add(lineSubtotal);
    detalles.push({
      varianteId: variante.id,
      cantidad: item.cantidad,
      precioUnit,
      subtotal: lineSubtotal,
      notas: item.notas,
      modificadores: lineMods,
    });
  }

  return { subtotal, detalles, stockDeltas };
}
