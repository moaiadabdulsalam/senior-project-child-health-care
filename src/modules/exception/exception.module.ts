import { Module } from '@nestjs/common';
import { ExceptionController } from './controllers/exception.controller';
import { ExceptionService } from './services/exception.service';
import { AuthModule } from '../auth/auth.module';
import { AvailabilityPolicyModule } from '../availability-policy/availability-policy.module';
import { ExceptionRepository } from './repositories/exception.repositories';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [AuthModule, AvailabilityPolicyModule, AppointmentModule],
  providers: [ExceptionService, ExceptionRepository],
  controllers: [ExceptionController],
})
export class ExceptionModule {}
