import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MedicationDosesRepository } from '../repositories/medicationDoses.repository';
import { UpdateMedicationDoseDto } from '../dtos/updateDose.dto';
import { medicationRepository } from '../repositories/medication.repositories';
import { Prisma } from '@prisma/client';

@Injectable()
export class MedicationDoseService {
  constructor(
    private readonly medicationDosesRepo: MedicationDosesRepository,
    private readonly medicationRepo: medicationRepository,
  ) {}

  private combineDateAndTime(datePart: Date, timePart: Date): Date {
    const combined = new Date(datePart);

    combined.setHours(
      timePart.getHours(),
      timePart.getMinutes(),
      timePart.getSeconds(),
      timePart.getMilliseconds(),
    );

    return combined;
  }

  private async getOneMedication(id: string) {
    const medication = await this.medicationRepo.getOne(id);
    if (!medication) {
      throw new NotFoundException('medication not found');
    }
    return medication;
  }

  async generateDoses(id: string) {
    const medication = await this.getOneMedication(id);
    const dosePerDay = medication.amountPerDay;
    if (!dosePerDay || dosePerDay < 0) {
      throw new BadRequestException('must be a greater than 0');
    }
    const intervalHours = 24 / dosePerDay;
    const doses: {
      medicationId: string;
      scheduledAt: Date;
    }[] = [];
    let start = this.combineDateAndTime(medication.firstDoseDate, medication.firstDoseTime);
    let end = new Date(medication.duration);
    let current = new Date(start);

    while (current <= end) {
      doses.push({
        medicationId: medication.id,
        scheduledAt: new Date(current),
      });
      current = new Date(current.getTime() + intervalHours * 60 * 60 * 1000);
    }
    if (doses.length) {
      await this.medicationDosesRepo.createManyDoses(doses);
    }
    return doses;
  }

  async regenerateDoses(id: string) {
    await this.getOneMedication(id);
    await this.medicationDosesRepo.deleteByMedicationId(id);
    return this.generateDoses(id);
  }

  async getReminderDetails(id: string) {
    await this.getOneMedication(id);
    const where: Prisma.MedicationDoseWhereInput = {
      medicationId: id,
    };
    return this.medicationDosesRepo.getAllDoses(where);
  }

  async updateDose(doseId: string, dto: UpdateMedicationDoseDto) {
    const dose = await this.medicationDosesRepo.getDose(doseId);
    if (!dose) {
      throw new NotFoundException('this dose not found');
    }
    if ((dose.taken || (dto.taken && dto.taken === true)) && dto.reminderSent) {
      throw new BadRequestException("reminder doesn't available");
    }

    if (dto.scheduledAt) {
      const newScheduled = new Date(dto.scheduledAt).getTime();
      if (newScheduled <= dose.scheduledAt.getTime()) {
        throw new BadRequestException('Invalid date');
      }
    }
    const doseUpdated = await this.medicationDosesRepo.updateDose({ ...dto }, doseId);
    return {
      doseUpdated,
      message: 'dose updated successfully',
    };
  }
}
