import { Module } from '@nestjs/common';
import { SalesModule } from '../sales/sales.module';
import { KdsController } from './kds.controller';
import { KdsGateway } from './kds.gateway';

@Module({
  imports: [SalesModule], // OrdersService para la cola; los eventos llegan vía EventEmitter2
  controllers: [KdsController],
  providers: [KdsGateway],
})
export class KdsModule {}
