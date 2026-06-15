import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { ORDER_STATUSES, PERMISSIONS, type JwtPayload, type OrderStatus } from '@poscoffe/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto, CreatePaymentDto } from './dto/payment.dto';
import { OrdersService } from './orders.service';

class UpdateEstadoDto {
  @IsIn(ORDER_STATUSES)
  estado!: OrderStatus;
}

@Controller('pedidos')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Query('local') localId: string, @Query('estado') estado?: string) {
    return this.orders.listOrders(localId, estado);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.orders.getOrder(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SALES_CREATE)
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.orders.createOrder(dto, user.sub);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.orders.updateEstado(id, dto.estado);
  }

  @Post(':id/pagos')
  @RequirePermissions(PERMISSIONS.SALES_CREATE)
  addPayment(@Param('id') id: string, @Body() dto: CreatePaymentDto) {
    return this.orders.addPayment(id, dto);
  }

  @Post(':id/cancelar')
  @RequirePermissions(PERMISSIONS.SALES_REFUND)
  cancel(@Param('id') id: string, @Body() dto: CancelOrderDto) {
    return this.orders.cancelOrder(id, dto);
  }
}
