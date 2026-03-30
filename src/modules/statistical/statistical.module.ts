import { Module } from '@nestjs/common';

import { ParentController } from './controllers/parent.controller';
import { DoctorController } from './controllers/doctor.controller';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { AuthModule } from '../auth/auth.module';
import { DoctorStatisticalRepository } from './repositories/doctor.repository';
import { AdminStatisticalRepository } from './repositories/admin.repository';
import { ParentStatisticalRepository } from './repositories/parent.repository';
import { ParentStatisticalService } from './services/parentStatistical.service';
import { DoctorStatisticalService } from './services/doctorStatistical.service';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [AuthModule , AppointmentModule],
  providers: [
    ParentStatisticalService,
    DoctorStatisticalService,
    AdminService,
    DoctorStatisticalRepository,
    AdminStatisticalRepository,
    ParentStatisticalRepository,
    
  ],
  controllers: [ParentController, DoctorController, AdminController],
})
export class StatisticalModule {}
