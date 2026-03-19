import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './core/core.module';
import { ChildModule } from './modules/child/child.module';
import { RedisModule } from './redis/redis.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { StatisticalModule } from './modules/statistical/statistical.module';

@Module({
  imports: [
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
  ],
})
export class AppModule {}
