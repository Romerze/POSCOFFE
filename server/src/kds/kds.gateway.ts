import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { EVENTS, type OrderEventPayload } from '../common/events';

const kdsRoom = (localId: string) => `local:${localId}:kds`;

/**
 * Gateway de tiempo real para el KDS (cocina/barista). Los clientes se unen a
 * la sala de su local y reciben altas/cambios de pedidos al instante.
 * Ver docs/06 §6.5 y §6.12.
 */
@WebSocketGateway({ cors: { origin: '*' } })
export class KdsGateway {
  @WebSocketServer()
  server!: Server;

  /** El cliente KDS indica el local que quiere observar. */
  @SubscribeMessage('kds:join')
  handleJoin(@MessageBody() data: { localId: string }, @ConnectedSocket() client: Socket): void {
    if (!data?.localId) return;
    client.join(kdsRoom(data.localId));
    client.emit('kds:joined', { localId: data.localId });
  }

  @OnEvent(EVENTS.ORDER_CREATED)
  onOrderCreated(payload: OrderEventPayload): void {
    this.server.to(kdsRoom(payload.localId)).emit('kds:order_created', payload.order);
  }

  @OnEvent(EVENTS.ORDER_UPDATED)
  onOrderUpdated(payload: OrderEventPayload): void {
    this.server.to(kdsRoom(payload.localId)).emit('kds:order_updated', payload.order);
  }
}
