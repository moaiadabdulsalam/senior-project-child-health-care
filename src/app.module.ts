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
import { UsersModule } from './modules/users/users.module';
import { DoctorsParentModule } from './modules/doctors-parent/doctors-parent.module';
import { MedicationModule } from './modules/medication/medication.module';
import { StripeModule } from './modules/strip/strip.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PublicLandingModule } from './modules/public-landing/public-landing.module';
import { UploadModule } from './modules/upload/upload.module';
import { GameModule } from './modules/game/game.module';
import { LoginChildModule } from './modules/login-child/login-child.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    UsersModule,
    DoctorsParentModule,
    MedicationModule,
    StripeModule,
    NotificationModule,
    PublicLandingModule,
    UploadModule,
    GameModule,
    LoginChildModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
