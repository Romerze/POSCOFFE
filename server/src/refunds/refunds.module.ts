import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { RefundsController } from './refunds.controller';
import { RefundsService } from './refunds.service';

@Module({
  imports: [InventoryModule], // StockService para reincorporar stock
  controllers: [RefundsController],
  providers: [RefundsService],
})
export class RefundsModule {}
