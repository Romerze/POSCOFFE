import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { StockService } from './stock.service';

@Module({
  imports: [CatalogModule], // CostingService para recostear al cambiar costo de insumo
  controllers: [InventoryController],
  providers: [InventoryService, StockService],
  exports: [StockService],
})
export class InventoryModule {}
