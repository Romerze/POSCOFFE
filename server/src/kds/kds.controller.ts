import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from '../sales/orders.service';

/** Cola del KDS: pedidos activos (no entregados ni cancelados) por local. */
@Controller('kds')
export class KdsController {
  constructor(private readonly orders: OrdersService) {}

  @Get('cola')
  async cola(@Query('local') localId: string) {
    const todos = await this.orders.listOrders(localId);
    return todos.filter((p) => p.estado !== 'entregado' && p.estado !== 'cancelado');
  }
}
