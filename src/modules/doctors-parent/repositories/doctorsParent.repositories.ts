import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DoctorsParentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDoctors(where: Prisma.UserWhereInput, skip: number, limit: number) {
    return await this.prisma.user.findMany({
      where,
      select,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async count(where: Prisma.UserWhereInput) {
    return await this.prisma.user.count({ where });
  }
  async getOne(id: string) {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
      select,
    });
  }
}
const select = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  profileDoctory: {
    select: {
      id: true,
      fullName: true,
      fullNameArabic: true,
      speciality: true,
      specialityArabic: true,
      description: true,
      phone: true,
      clinicPhone: true,
      clinicAddress: true,
      clinicAddressArabic: true,
      clinicName: true,
      clinicNameArabic: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;
//4/13/2026