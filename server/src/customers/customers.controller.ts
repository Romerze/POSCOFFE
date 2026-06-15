import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CanjearDto, CreateClienteDto } from './dto/cliente.dto';

@Controller('clientes')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get('identificar')
  identificar(@Query('telefono') telefono: string) {
    return this.customers.identificar(telefono);
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
