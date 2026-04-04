import { Module, ParseIntPipe } from '@nestjs/common';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import { AppointmentReminder } from './jobs/reminderAppointment';

@Module({
  imports: [AuthModule, NotificationModule],
  providers: [AppointmentRepository, AppointmentService, AppointmentReminder],
  exports: [AppointmentRepository],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
