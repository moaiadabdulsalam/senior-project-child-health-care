import { Injectable } from '@nestjs/common';
import { DoctorStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DoctorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDoctors() {
    return this.prisma.user.findMany({
      where: {
        role: Role.DOCTOR,
      },
      select,
    });
  }

  async getOne(id: string) {
    return this.prisma.user.findFirst({
      where: { id },
      select,
    });
  }

  async createUserDoctor(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({
      data,
    });
  }

  async getOneByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select ,
    });
  }
  async updateDoctorsActivity(id: string, data: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getRequestDoctor() {
    return this.prisma.user.findMany({
      where: {
        profileDoctory: {
          status: DoctorStatus.VERIFYING,
        },
      },
      select,
    });
  }

  async answerRequest(id: string, status: DoctorStatus) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        profileDoctory: {
          update: {
            status,
          },
        },
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
      certificateKey:true,
      certificateUrl:true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;
//4/13/2026