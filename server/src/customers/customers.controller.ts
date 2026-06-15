import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { IntelligenceService } from './intelligence.service';
import { CanjearDto, CreateClienteDto } from './dto/cliente.dto';

@Controller('clientes')
export class CustomersController {
  constructor(
    private readonly customers: CustomersService,
    private readonly intelligence: IntelligenceService,
  ) {}

  @Get('identificar')
  identificar(@Query('telefono') telefono: string) {
    return this.customers.identificar(telefono);
  }

  /** Recalcula la segmentación RFM + VIP de todos los clientes. */
  @Post('recomputar-segmentos')
  @RequirePermissions(PERMISSIONS.REPORTS_VIEW)
  recomputarTodos() {
    return this.intelligence.recomputarTodos();
  }

  @Get(':id/recomendaciones')
  recomendaciones(@Param('id') id: string) {
    return this.intelligence.recomendaciones(id);
  }

  @Post(':id/segmentar')
  segmentar(@Param('id') id: string) {
    return this.intelligence.recomputarCliente(id);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.customers.getCliente(id);
  }

  @Post()
  create(@Body() dto: CreateClienteDto) {
    return this.customers.createCliente(dto);
  }

  @Post('fidelizacion/canjear')
  canjear(@Body() dto: CanjearDto) {
    return this.customers.canjear(dto);
  }
}
