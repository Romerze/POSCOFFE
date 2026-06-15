import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { PERMISSIONS } from '@poscoffe/types';
import { RequirePermissions } from '../common/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/categoria.dto';
import {
  CreateModificadorDto,
  CreateModificadorGrupoDto,
  LinkGrupoProductoDto,
} from './dto/modificador.dto';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';
import { SetRecetaItemDto } from './dto/receta.dto';
import { CreateVarianteDto, UpdateVarianteDto } from './dto/variante.dto';

const MANAGE = PERMISSIONS.CATALOG_MANAGE;

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  // Categorías
  @Get('categorias')
  listCategorias(@Query('local') localId: string) {
    return this.catalog.listCategorias(localId);
  }

  @Post('categorias')
  @RequirePermissions(MANAGE)
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.catalog.createCategoria(dto);
  }

  @Patch('categorias/:id')
  @RequirePermissions(MANAGE)
  updateCategoria(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.catalog.updateCategoria(id, dto);
  }

  // Productos
  @Get('productos')
  listProductos(@Query('local') localId: string) {
    return this.catalog.listProductos(localId);
  }

  @Get('productos/:id')
  getProducto(@Param('id') id: string) {
    return this.catalog.getProducto(id);
  }

  @Post('productos')
  @RequirePermissions(MANAGE)
  createProducto(@Body() dto: CreateProductoDto) {
    return this.catalog.createProducto(dto);
  }

  @Patch('productos/:id')
  @RequirePermissions(MANAGE)
  updateProducto(@Param('id') id: string, @Body() dto: UpdateProductoDto) {
    return this.catalog.updateProducto(id, dto);
  }

  // Variantes
  @Post('variantes')
  @RequirePermissions(MANAGE)
  createVariante(@Body() dto: CreateVarianteDto) {
    return this.catalog.createVariante(dto);
  }

  @Patch('variantes/:id')
  @RequirePermissions(MANAGE)
  updateVariante(@Param('id') id: string, @Body() dto: UpdateVarianteDto) {
    return this.catalog.updateVariante(id, dto);
  }

  // Recetas
  @Get('variantes/:id/receta')
  getReceta(@Param('id') id: string) {
    return this.catalog.getReceta(id);
  }

  @Put('variantes/:id/receta')
  @RequirePermissions(MANAGE)
  setReceta(@Param('id') id: string, @Body() items: SetRecetaItemDto[]) {
    return this.catalog.setReceta(id, items);
  }

  // Modificadores
  @Post('modificador-grupos')
  @RequirePermissions(MANAGE)
  createModificadorGrupo(@Body() dto: CreateModificadorGrupoDto) {
    return this.catalog.createModificadorGrupo(dto);
  }

  @Post('modificadores')
  @RequirePermissions(MANAGE)
  createModificador(@Body() dto: CreateModificadorDto) {
    return this.catalog.createModificador(dto);
  }

  @Post('producto-modificador-grupos')
  @RequirePermissions(MANAGE)
  linkGrupoProducto(@Body() dto: LinkGrupoProductoDto) {
    return this.catalog.linkGrupoProducto(dto);
  }
}
