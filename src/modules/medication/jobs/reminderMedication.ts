import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { medicationRepository } from '../repositories/medication.repositories';
import { NotificationType, Prisma } from '@prisma/client';
import { MedicationDosesRepository } from '../repositories/medicationDoses.repository';

@Injectable()
export class MedicationReminder {
  private readonly logger = new Logger(MedicationReminder.name);
  constructor(
    private notification: NotificationService,
    private medicationDoseRepo: MedicationDosesRepository,
  ) {}
  @Cron(CronExpression.EVERY_MINUTE)
  async handleReminders() {
    this.logger.log('Running reminder scheduler...');
    await this.handleMedicationReminders();
  }
  private async handleMedicationReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 5 * 60 * 1000 - 30 * 1000);
    const to = new Date(now.getTime() + 5 * 60 * 1000 + 30 * 1000);

    const where: Prisma.MedicationDoseWhereInput = {
      scheduledAt: {
        gte: from,
        lte: to,
      },
      reminderSent: false,
    };
    const doses = await this.medicationDoseRepo.getAllDoses(where);
    for (const dose of doses) {
      await this.notification.create({
        userId: dose.medication.profileParent.userId,
        title: 'تذكير بالدواء',
        message: `بعد 5 دقائق يحين موعد إعطاء ${dose.medication.medicineName} للطفل ${dose.medication.child.fullName}.`,
        type: NotificationType.MEDICATION_REMINDER,
        data: {
          reminderKind: 'medication',
          medicationId: dose.medicationId,
          doseId: dose.id,
          childId: dose.medication.childId,
          scheduledFor: dose.scheduledAt.toISOString(),
        },
      });

      await this.medicationDoseRepo.updateDose(
        {
          reminderSent: true,
        },
        dose.id,
      );
    }
  }
}
