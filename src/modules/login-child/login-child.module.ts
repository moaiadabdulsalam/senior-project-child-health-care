import { Module } from '@nestjs/common';
import { LoginChildController } from './controllers/login-child.controller';
import { SameDeviceService } from './services/same-device.service';
import { QrDeviceService } from './services/qr-device.service';
import { AuthModule } from '../auth/auth.module';
import { ChildModule } from '../child/child.module';
import { LoginChildRepository } from './repositories/LoginChild.repository';
import { ChildAccessGuard } from './guard/loginChild.guard';
import { LoginChildService } from './services/login-child.service';
import { DeviceLinkRepository } from './repositories/deviceLink.repository';

@Module({
  imports: [AuthModule, ChildModule],
  controllers: [LoginChildController],
  providers: [
    SameDeviceService,
    QrDeviceService,
    LoginChildRepository,
    ChildAccessGuard,
    LoginChildService,
    DeviceLinkRepository,
  ],
  exports: [ChildAccessGuard, LoginChildRepository],
})
export class LoginChildModule {}
