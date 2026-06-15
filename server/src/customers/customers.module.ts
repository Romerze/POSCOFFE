import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { IntelligenceService } from './intelligence.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService, IntelligenceService],
})
export class CustomersModule {}
