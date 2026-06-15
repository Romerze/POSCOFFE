import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [InventoryModule], // StockService para descontar/reponer stock
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class SalesModule {}
