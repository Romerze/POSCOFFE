import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LocalsModule } from './locals/locals.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    LocalsModule,
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
