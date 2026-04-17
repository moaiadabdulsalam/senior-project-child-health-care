import { Injectable } from '@nestjs/common';
import { Medication, MedicationStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class medicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async count(where: Prisma.MedicationWhereInput) {
    return await this.prisma.medication.count({
      where,
    });
  }
  async getAllMedication(where: Prisma.MedicationWhereInput, skip?: number, limit?: number) {
    return await this.prisma.medication.findMany({
      where,
      take: limit,
      skip,
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async getOne(id: string): Promise<Medication | null> {
    return this.prisma.medication.findUnique({
      where: {
        id,
      },
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async existingMedication(data: { medicineName?: string; mdeicineNameArabic?: string }) {
    return await this.prisma.medication.findFirst({
      where: {
        OR: [
          ...(data.medicineName ? [{ medicineName: data.medicineName }] : []),
          ...(data.mdeicineNameArabic ? [{ mdeicineNameArabic: data.mdeicineNameArabic }] : []),
        ],
        status: MedicationStatus.ACTIVE,
      },
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
      },
    });
  }

  async createMedication(data: Prisma.MedicationUncheckedCreateInput) {
    return await this.prisma.medication.create({
      data,
    });
  }

  async updateMedication(data: Prisma.MedicationUpdateInput, id: string) {
    return await this.prisma.medication.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteMedication(id: string) {
    return await this.prisma.medication.delete({
      where: {
        id,
      },
    });
  }
}
