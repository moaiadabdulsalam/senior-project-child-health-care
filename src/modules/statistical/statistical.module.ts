import { Module } from '@nestjs/common';
import { DoctorService } from './services/doctor.service';
import { ParentService } from './services/parent.service';
import { ParentController } from './controllers/parent.controller';
import { DoctorController } from './controllers/doctor.controller';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';

;

@Module({
  providers: [DoctorService, ParentService, DoctorService, AdminService],
  controllers: [ParentController, DoctorController, AdminController]
})
export class StatisticalModule {}
