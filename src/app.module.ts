import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { ChildModule } from './modules/child/child.module';
import { RedisModule } from './redis/redis.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { StatisticalModule } from './modules/statistical/statistical.module';
import { AvailabilityPolicyModule } from './modules/availability-policy/availability-policy.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ExceptionModule } from './modules/exception/exception.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CoreModule,
    ChildModule,
    RedisModule,
    AppointmentModule,
    StatisticalModule,
    AvailabilityPolicyModule,
    ExceptionModule,
    ProfileModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  
})
export class AppModule {}
