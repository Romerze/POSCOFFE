import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateRetoDto } from './dto/reto.dto';
import { GamificationService } from './gamification.service';

@Controller()
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('retos')
  list(@Query('local') localId?: string) {
    return this.gamification.list(localId);
  }

  @Post('retos')
  @RequirePermissions(PERMISSIONS.CATALOG_MANAGE)
  create(@Body() dto: CreateRetoDto) {
    return this.gamification.create(dto);
  }

  @Get('clientes/:id/gamificacion')
  deCliente(@Param('id') id: string) {
    return this.gamification.deCliente(id);
  }
}
