import { Injectable } from '@nestjs/common';
import { MedicationDose, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class MedicationDosesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createManyDoses(data: Prisma.MedicationDoseCreateManyInput[]) {
    return this.prisma.medicationDose.createMany({
      data,
    });
  }
  async getAllDoses(where: Prisma.MedicationDoseWhereInput) {
    return this.prisma.medicationDose.findMany({
      where,
      include: {
        medication: {
          include: {
            child: true,
            profileParent: true,
          },
        },
      },
    });
  }
  async getDose(id: string) {
    return this.prisma.medicationDose.findUnique({
      where: { id },
    });
  }

  async updateDose(data: Prisma.MedicationDoseUpdateInput, id: string) {
    return this.prisma.medicationDose.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteByMedicationId(medicationId: string) {
    return this.prisma.medicationDose.deleteMany({
      where: {
        medicationId,
      },
    });
  }
}
