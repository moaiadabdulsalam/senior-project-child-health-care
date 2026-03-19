import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';
import { jwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guard/jwt.guard';
import { ProfileParentRepository } from './repositories/profileParent.repository';
import { ProfileDoctorRepository } from './repositories/profileDoctory.repository';
import { RedisModule } from 'src/redis/redis.module';
import { CookieService } from './services/cookie.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RefreshTokenGuard } from './guard/refreshToken.guard';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 20,
      },
      
    ]),
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide:APP_GUARD,
      useClass:ThrottlerGuard
    },
    CookieService,
    AuthService,
    jwtStrategy,
    RefreshTokenStrategy,
    AuthRepository,
    JwtAuthGuard,
    ProfileParentRepository,
    ProfileDoctorRepository,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
