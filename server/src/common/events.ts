/** Eventos de dominio emitidos vía EventEmitter2 (desacople entre módulos). */
export const EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
} as const;

export interface OrderEventPayload {
  localId: string;
  order: unknown; // pedido con detalles (forma de OrdersService)
}
