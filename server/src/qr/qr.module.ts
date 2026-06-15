import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { SalesModule } from '../sales/sales.module';
import { QrController } from './qr.controller';

@Module({
  imports: [CatalogModule, SalesModule],
  controllers: [QrController],
})
export class QrModule {}
