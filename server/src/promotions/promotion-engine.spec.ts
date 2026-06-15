import { evaluatePromotions, type CartLine, type PromoEvaluable } from './promotion-engine';

const lines: CartLine[] = [
  { varianteId: 'latte', cantidad: 2, precioUnit: 12 }, // 24
  { varianteId: 'pan', cantidad: 1, precioUnit: 6 }, // 6 → subtotal 30
];

const at = (h: number, m = 0) => new Date(2026, 5, 15, h, m);

describe('evaluatePromotions', () => {
  it('aplica descuento porcentaje sobre todo el carrito', () => {
    const promo: PromoEvaluable = {
      id: 'p1',
      nombre: '10% off',
      tipo: 'descuento',
      prioridad: 1,
      condicion: {},
      efecto: { tipo: 'porcentaje', valor: 10 },
    };
    const r = evaluatePromotions(lines, [promo], at(10));
    expect(r.descuento).toBe(3); // 10% de 30
    expect(r.aplicada?.id).toBe('p1');
  });

  it('hora valle: solo aplica dentro de la franja', () => {
    const promo: PromoEvaluable = {
      id: 'hv',
      nombre: 'Hora valle',
      tipo: 'hora_valle',
      prioridad: 1,
      condicion: { franja: { desde: '15:00', hasta: '18:00' } },
      efecto: { tipo: 'porcentaje', valor: 20 },
    };
    expect(evaluatePromotions(lines, [promo], at(16)).descuento).toBe(6); // dentro
    expect(evaluatePromotions(lines, [promo], at(12)).descuento).toBe(0); // fuera
  });

  it('respeta monto mínimo', () => {
    const promo: PromoEvaluable = {
      id: 'min',
      nombre: 'Min 50',
      tipo: 'descuento',
      prioridad: 1,
      condicion: { montoMinimo: 50 },
      efecto: { tipo: 'monto', valor: 5 },
    };
    expect(evaluatePromotions(lines, [promo], at(10)).descuento).toBe(0); // subtotal 30 < 50
  });

  it('descuento porcentaje solo sobre variantes en scope', () => {
    const promo: PromoEvaluable = {
      id: 'scope',
      nombre: '50% lattes',
      tipo: 'descuento',
      prioridad: 1,
      condicion: { varianteIds: ['latte'] },
      efecto: { tipo: 'porcentaje', valor: 50 },
    };
    expect(evaluatePromotions(lines, [promo], at(10)).descuento).toBe(12); // 50% de 24
  });

  it('NxM: 2x1 en lattes (2 unidades → 1 gratis)', () => {
    const promo: PromoEvaluable = {
      id: 'nxm',
      nombre: '2x1 latte',
      tipo: 'nxm',
      prioridad: 1,
      condicion: { varianteIds: ['latte'] },
      efecto: { tipo: 'nxm', n: 2, m: 1 },
    };
    expect(evaluatePromotions(lines, [promo], at(10)).descuento).toBe(12); // 1 latte gratis
  });

  it('elige la promo de mayor prioridad (no acumulable)', () => {
    const baja: PromoEvaluable = {
      id: 'baja', nombre: '5%', tipo: 'descuento', prioridad: 1,
      condicion: {}, efecto: { tipo: 'porcentaje', valor: 5 },
    };
    const alta: PromoEvaluable = {
      id: 'alta', nombre: '20%', tipo: 'descuento', prioridad: 10,
      condicion: {}, efecto: { tipo: 'porcentaje', valor: 20 },
    };
    const r = evaluatePromotions(lines, [baja, alta], at(10));
    expect(r.aplicada?.id).toBe('alta');
    expect(r.descuento).toBe(6);
  });

  it('sin promos aplicables → descuento 0', () => {
    expect(evaluatePromotions(lines, [], at(10))).toEqual({ descuento: 0, aplicada: null });
  });
});
