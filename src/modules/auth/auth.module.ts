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
@Module({
  imports: [JwtModule.register({}) , RedisModule],
  controllers: [AuthController],
  providers: [AuthService, jwtStrategy, AuthRepository, JwtAuthGuard , ProfileParentRepository , ProfileDoctorRepository],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
