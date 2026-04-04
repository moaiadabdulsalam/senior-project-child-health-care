import { Module } from '@nestjs/common';
import { MedicationController } from './controllers/medication.controller';
import { MedicationService } from './services/medication.service';
import { medicationRepository } from './repositories/medication.repositories';
import { AuthModule } from '../auth/auth.module';
import { ChildModule } from '../child/child.module';
import { MedicationReminder } from './jobs/reminderMedication';
import { MedicationDosesRepository } from './repositories/medicationDoses.repository';
import { MedicationDoseService } from './services/medication-dose.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuthModule, ChildModule, NotificationModule],
  controllers: [MedicationController],
  providers: [
    MedicationService,
    medicationRepository,
    MedicationReminder,
    MedicationDosesRepository,
    MedicationDoseService,
  ],
})
export class MedicationModule {}
