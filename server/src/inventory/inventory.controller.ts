import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { PERMISSIONS, type JwtPayload } from '@poscoffe/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateInsumoDto, SetUmbralesDto, UpdateInsumoDto } from './dto/insumo.dto';
import { AjusteStockDto, CreateMermaDto, CreateReposicionDto } from './dto/movimiento.dto';
import { InventoryService } from './inventory.service';

const MANAGE = PERMISSIONS.INVENTORY_MANAGE;

@Controller()
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  // Insumos
  @Get('insumos')
  listInsumos() {
    return this.inventory.listInsumos();
  }

  @Post('insumos')
  @RequirePermissions(MANAGE)
  createInsumo(@Body() dto: CreateInsumoDto) {
    return this.inventory.createInsumo(dto);
  }

  @Patch('insumos/:id')
  @RequirePermissions(MANAGE)
  updateInsumo(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
    return this.inventory.updateInsumo(id, dto);
  }

  // Inventario por local
  @Get('inventario')
  listInventario(@Query('local') localId: string) {
    return this.inventory.listInventario(localId);
  }

  @Put('inventario/:local/:insumo/umbrales')
  @RequirePermissions(MANAGE)
  setUmbrales(
    @Param('local') localId: string,
    @Param('insumo') insumoId: string,
    @Body() dto: SetUmbralesDto,
  ) {
    return this.inventory.setUmbrales(localId, insumoId, dto);
  }

  // Movimientos
  @Post('inventario/reposiciones')
  @RequirePermissions(MANAGE)
  reposicion(@Body() dto: CreateReposicionDto, @CurrentUser() user: JwtPayload) {
    return this.inventory.reposicion(dto, user.sub);
  }

  @Post('inventario/mermas')
  @RequirePermissions(MANAGE)
  merma(@Body() dto: CreateMermaDto, @CurrentUser() user: JwtPayload) {
    return this.inventory.merma(dto, user.sub);
  }

  @Post('inventario/ajustes')
  @RequirePermissions(MANAGE)
  ajuste(@Body() dto: AjusteStockDto) {
    return this.inventory.ajuste(dto);
  }

  // Alertas
  @Get('inventario/alertas')
  listAlertas(@Query('local') localId: string) {
    return this.inventory.listAlertas(localId);
  }
}
