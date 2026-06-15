import { Prisma } from '@prisma/client';
import { refundAmount } from './refund-rules';

const D = (n: number) => new Prisma.Decimal(n);

describe('refundAmount', () => {
  it('sin descuento devuelve el monto de las líneas', () => {
    expect(refundAmount(D(15), D(30), D(30)).toNumber()).toBe(15);
  });

  it('prorratea por el descuento de pedido (pagó 24 por 30)', () => {
    // 1 línea de 15 sobre subtotal 30 con total 24 → 15 * 24/30 = 12
    expect(refundAmount(D(15), D(30), D(24)).toNumber()).toBe(12);
  });

  it('subtotal 0 no divide por cero', () => {
    expect(refundAmount(D(0), D(0), D(0)).toNumber()).toBe(0);
  });
});
