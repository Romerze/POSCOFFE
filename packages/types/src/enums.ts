/** Canal de venta de un pedido. Ver docs/07-modelo-datos.md */
export const ORDER_CHANNELS = ['mostrador', 'qr', 'pickup', 'delivery'] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

/** Estados de un pedido a lo largo del flujo + KDS. */
export const ORDER_STATUSES = [
  'pendiente',
  'en_preparacion',
  'listo',
  'entregado',
  'cancelado',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Métodos de pago soportados (extensible por adaptador). */
export const PAYMENT_METHODS = ['efectivo', 'tarjeta', 'digital'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Tipos de movimiento de stock (append-only, sync por deltas). */
export const STOCK_MOVEMENT_TYPES = [
  'venta',
  'reposicion',
  'merma',
  'ajuste',
  'transferencia',
] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];
