import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreatePromocionDto, EvaluarPromosDto, UpdatePromocionDto } from './dto/promotion.dto';
import { PromotionsService } from './promotions.service';

@Controller()
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get('promociones')
  list(@Query('local') localId?: string) {
    return this.promotions.list(localId);
  }

  @Post('promociones')
  @RequirePermissions(PERMISSIONS.CATALOG_MANAGE)
  create(@Body() dto: CreatePromocionDto) {
    return this.promotions.create(dto);
  }

  @Patch('promociones/:id')
  @RequirePermissions(PERMISSIONS.CATALOG_MANAGE)
  update(@Param('id') id: string, @Body() dto: UpdatePromocionDto) {
    return this.promotions.update(id, dto);
  }

  /** Previsualiza el descuento aplicable a un carrito (para la caja). */
  @Post('carrito/evaluar-promos')
  evaluar(@Body() dto: EvaluarPromosDto) {
    return this.promotions.evaluateForCart(dto.localId, dto.items);
  }
}
