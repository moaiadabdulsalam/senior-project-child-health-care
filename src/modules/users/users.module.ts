import { Module } from '@nestjs/common';

import { DoctorsController } from './controllers/doctors.controller';
import { ParentController } from './controllers/parents.controller';
import { DoctorsService } from './services/doctors.service';
import { ParentsService } from './services/parents.service';
import { DoctorsRepository } from './repositories/doctors.repository';
import { ParentsRepository } from './repositories/parents.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DoctorsService, ParentsService, DoctorsRepository, ParentsRepository],
  controllers: [DoctorsController, ParentController],
})
export class UsersModule {}
