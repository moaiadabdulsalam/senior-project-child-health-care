import { Module } from '@nestjs/common';
import { MedicationController } from './controllers/medication.controller';
import { MedicationService } from './services/medication.service';
import { medicationRepository } from './repositories/medication.repositories';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService , medicationRepository]
})
export class MedicationModule {}
