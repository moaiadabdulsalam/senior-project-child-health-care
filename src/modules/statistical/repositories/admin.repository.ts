import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AdminStatisticalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async totalParent() {
    return await this.prisma.user.count({
      where: {
        role: Role.PARENT,
      },
    });
  }
  async totalChild() {
    return await this.prisma.child.count();
  }
  async doctors() {
    return await this.prisma.user.findMany({
      where: {
        role: Role.DOCTOR,
      },
      select,
    });
  }
  async totalActiveUser() {
    return await this.prisma.user.count({
      where: {
        isActive: true,
      },
    });
  }
  async speciality() {
    return await this.prisma.profileDoctor.groupBy({
      by: ['speciality'],
      where: {
        speciality: {
          notIn:[''],
        },
      },
      _count: { speciality: true },
      orderBy : {
        _count:{
          speciality : 'desc'
        }
      }
    });
  }

  async genderDistribution() {
    return await this.prisma.child.groupBy({
      by: ['gender'],
      _count: { gender: true },
    });
  }

}
const select = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
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