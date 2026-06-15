import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { ConsumirDto, CreateSuscripcionDto } from './dto/subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('suscripciones')
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get()
  listByCliente(@Query('cliente') clienteId: string) {
    return this.subscriptions.listByCliente(clienteId);
  }

  @Get('activa')
  activa(@Query('cliente') clienteId: string) {
    return this.subscriptions.activaDeCliente(clienteId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  create(@Body() dto: CreateSuscripcionDto) {
    return this.subscriptions.create(dto);
  }

  @Post(':id/consumir')
  @RequirePermissions(PERMISSIONS.SALES_CREATE)
  consumir(@Param('id') id: string, @Body() dto: ConsumirDto) {
    return this.subscriptions.consumir(id, dto);
  }

  @Post(':id/cancelar')
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  cancelar(@Param('id') id: string) {
    return this.subscriptions.cancelar(id);
  }
}
