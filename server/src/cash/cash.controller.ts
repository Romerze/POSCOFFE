import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PERMISSIONS, type JwtPayload } from '@poscoffe/types';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CashService } from './cash.service';
import { AbrirTurnoDto, CerrarCajaDto, CreateCajaDto, RetiroDto } from './dto/cash.dto';

@Controller()
export class CashController {
  constructor(private readonly cash: CashService) {}

  @Get('cajas')
  listCajas(@Query('local') localId: string) {
    return this.cash.listCajas(localId);
  }

  @Post('cajas')
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  createCaja(@Body() dto: CreateCajaDto) {
    return this.cash.createCaja(dto);
  }

  @Get('turnos/abierto')
  turnoAbierto(@Query('local') localId: string) {
    return this.cash.turnoAbierto(localId);
  }

  @Post('turnos/abrir')
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  abrirTurno(@Body() dto: AbrirTurnoDto, @CurrentUser() user: JwtPayload) {
    return this.cash.abrirTurno(dto, user.sub);
  }

  @Post('caja/retiro')
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  retiro(@Body() dto: RetiroDto) {
    return this.cash.registrarRetiro(dto);
  }

  @Post('caja/cerrar')
  @RequirePermissions(PERMISSIONS.CASH_MANAGE)
  cerrarCaja(@Body() dto: CerrarCajaDto) {
    return this.cash.cerrarCaja(dto);
  }
}
