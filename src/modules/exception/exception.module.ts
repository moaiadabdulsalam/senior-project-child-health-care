import { forwardRef, Module, ParseIntPipe } from '@nestjs/common';
import { ExceptionController } from './controllers/exception.controller';
import { ExceptionService } from './services/exception.service';
import { AuthModule } from '../auth/auth.module';
import { AvailabilityPolicyModule } from '../availability-policy/availability-policy.module';
import { ExceptionRepository } from './repositories/exception.repositories';
import { AppointmentModule } from '../appointment/appointment.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, AvailabilityPolicyModule, forwardRef(()=>AppointmentModule) , NotificationModule],
  providers: [ExceptionService, ExceptionRepository],
  controllers: [ExceptionController],
  exports : [ExceptionRepository]
})
export class ExceptionModule {}
