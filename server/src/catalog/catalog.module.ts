import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CostingService } from './costing.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, CostingService],
  exports: [CostingService, CatalogService],
})
export class CatalogModule {}
