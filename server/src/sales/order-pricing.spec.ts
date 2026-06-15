import { Prisma } from '@prisma/client';
import {
  priceOrder,
  type ModificadorForPricing,
  type VarianteForPricing,
} from './order-pricing';

const D = (n: number) => new Prisma.Decimal(n);

describe('priceOrder', () => {
  const latteGrande: VarianteForPricing = {
    id: 'latte-g',
    precio: D(12),
    receta: [
      { insumoId: 'cafe', cantidad: D(18) }, // 18 g por bebida
      { insumoId: 'leche', cantidad: D(200) }, // 200 ml por bebida
    ],
  };

  const shotExtra: ModificadorForPricing = {
    id: 'shot',
    precioExtra: D(2),
    insumoId: 'cafe',
    cantidadInsumo: D(9), // +9 g de café
  };

  const lecheAvena: ModificadorForPricing = {
    id: 'avena',
    precioExtra: D(1.5),
    insumoId: null,
    cantidadInsumo: null,
  };

  const varMap = new Map([[latteGrande.id, latteGrande]]);
  const modMap = new Map([
    [shotExtra.id, shotExtra],
    [lecheAvena.id, lecheAvena],
  ]);

  it('calcula subtotal con precio base por cantidad', () => {
    const r = priceOrder([{ varianteId: 'latte-g', cantidad: 2 }], varMap, modMap);
    expect(r.subtotal.toNumber()).toBe(24);
    expect(r.stockDeltas.get('cafe')!.toNumber()).toBe(-36); // 18 × 2
    expect(r.stockDeltas.get('leche')!.toNumber()).toBe(-400); // 200 × 2
  });

  it('suma precio extra de modificadores al precio unitario', () => {
    const r = priceOrder(
      [{ varianteId: 'latte-g', cantidad: 1, modificadorIds: ['shot', 'avena'] }],
      varMap,
      modMap,
    );
    // 12 + 2 + 1.5 = 15.5
    expect(r.subtotal.toNumber()).toBe(15.5);
    expect(r.detalles[0].precioUnit.toNumber()).toBe(15.5);
  });

  it('descuenta insumo extra del modificador agregado a la receta', () => {
    const r = priceOrder(
      [{ varianteId: 'latte-g', cantidad: 1, modificadorIds: ['shot'] }],
      varMap,
      modMap,
    );
    // café: 18 (receta) + 9 (shot) = 27 g
    expect(r.stockDeltas.get('cafe')!.toNumber()).toBe(-27);
  });

  it('lanza error si la variante no existe', () => {
    expect(() => priceOrder([{ varianteId: 'x', cantidad: 1 }], varMap, modMap)).toThrow();
  });
});
