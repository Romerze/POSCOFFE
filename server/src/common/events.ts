/** Eventos de dominio emitidos vía EventEmitter2 (desacople entre módulos). */
export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_PAID: 'order.paid',
} as const;

export interface OrderEventPayload {
  localId: string;
  order: unknown; // pedido con detalles (forma de OrdersService)
}

export interface OrderPaidPayload {
  clienteId: string;
  pedidoId: string;
  monto: number; // monto del pago para acreditar puntos
}
