import { Prisma } from '@prisma/client';

/**
 * Monto a devolver de un conjunto de líneas, prorrateado por el descuento a
 * nivel de pedido: se reembolsa lo realmente pagado, no el precio de lista.
 * Ver docs/08 §8.9.
 */
export function refundAmount(
  lineSum: Prisma.Decimal,
  subtotal: Prisma.Decimal,
  total: Prisma.Decimal,
): Prisma.Decimal {
  if (subtotal.lte(0)) return lineSum.toDecimalPlaces(2);
  return lineSum.mul(total).div(subtotal).toDecimalPlaces(2);
}
