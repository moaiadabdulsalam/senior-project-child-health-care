import { forwardRef, Module, ParseIntPipe } from '@nestjs/common';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { AppointmentReminder } from './jobs/reminderAppointment';
import { AvailabilityPolicyModule } from '../availability-policy/availability-policy.module';
import { ExceptionModule } from '../exception/exception.module';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [
    AuthModule,
    NotificationModule,
    AvailabilityPolicyModule,
    ExceptionModule,
    forwardRef(() => ReviewModule),
  ],
  providers: [AppointmentRepository, AppointmentService, AppointmentReminder],
  exports: [AppointmentRepository],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
