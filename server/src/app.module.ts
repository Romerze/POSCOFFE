import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LocalsModule } from './locals/locals.module';
import { CatalogModule } from './catalog/catalog.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';
import { KdsModule } from './kds/kds.module';
import { CashModule } from './cash/cash.module';
import { CustomersModule } from './customers/customers.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ReportsModule } from './reports/reports.module';
import { QrModule } from './qr/qr.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { RefundsModule } from './refunds/refunds.module';
import { SurveysModule } from './surveys/surveys.module';
import { GamificationModule } from './gamification/gamification.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    AuthModule,
    LocalsModule,
    CatalogModule,
    InventoryModule,
    SalesModule,
    KdsModule,
    CashModule,
    CustomersModule,
    PromotionsModule,
    ReportsModule,
    QrModule,
    SubscriptionsModule,
    RefundsModule,
    SurveysModule,
    GamificationModule,
    HealthModule,
  ],
  providers: [
    // Auth global: cada endpoint exige JWT salvo que se marque @Public()
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RBAC global: respeta @Roles()/@RequirePermissions()
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
