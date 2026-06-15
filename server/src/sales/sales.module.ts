import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InventoryModule, PromotionsModule], // stock + motor de promociones
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class SalesModule {}
