import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PERMISSIONS, type JwtPayload } from '@poscoffe/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateRefundDto } from './dto/refund.dto';
import { RefundsService } from './refunds.service';

@Controller('pedidos/:id/devoluciones')
export class RefundsController {
  constructor(private readonly refunds: RefundsService) {}

  @Get()
  list(@Param('id') pedidoId: string) {
    return this.refunds.listByPedido(pedidoId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SALES_REFUND)
  devolver(
    @Param('id') pedidoId: string,
    @Body() dto: CreateRefundDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.refunds.devolver(pedidoId, dto, user.sub);
  }
}
