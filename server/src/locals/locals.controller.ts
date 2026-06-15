import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CreateLocalDto, UpdateLocalDto } from './dto/local.dto';
import { LocalsService } from './locals.service';

@Controller('locals')
export class LocalsController {
  constructor(private readonly locals: LocalsService) {}

  @Get()
  findAll() {
    return this.locals.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locals.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.LOCALS_MANAGE)
  create(@Body() dto: CreateLocalDto) {
    return this.locals.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.LOCALS_MANAGE)
  update(@Param('id') id: string, @Body() dto: UpdateLocalDto) {
    return this.locals.update(id, dto);
  }
}
