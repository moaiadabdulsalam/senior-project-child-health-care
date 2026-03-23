import { Module } from '@nestjs/common';
import { AppointmentRepository } from './repositories/appointment.repository';

@Module({
  providers: [AppointmentRepository],
  exports: [AppointmentRepository],
})
export class AppointmentModule {}
