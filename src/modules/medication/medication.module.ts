import { Module } from '@nestjs/common';
import { MedicationController } from './controllers/medication.controller';
import { MedicationService } from './services/medication.service';
import { medicationRepository } from './repositories/medication.repositories';
import { AuthModule } from '../auth/auth.module';
import { ChildModule } from '../child/child.module';

@Module({
  imports:[AuthModule , ChildModule],
  controllers: [MedicationController],
  providers: [MedicationService, medicationRepository],

})
export class MedicationModule {}
