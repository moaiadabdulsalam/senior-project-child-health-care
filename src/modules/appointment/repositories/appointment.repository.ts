import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAppointment(where: Prisma.AppointmentWhereInput, skip?: number, limit?: number) {
    return await this.prisma.appointment.findMany({
      where,
      skip,
      take: limit,
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
        profileDoctor: true,
        profileParent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async getOneAppointment(where: Prisma.AppointmentWhereInput) {
    return await this.prisma.appointment.findFirst({
      where,
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
        profileDoctor: true,
        profileParent: true,
      },
    });
  }
  async count(where: Prisma.AppointmentWhereInput) {
    return await this.prisma.appointment.count({
      where,
    });
  }

  async getOneAppointmentById(id: string) {
    return await this.prisma.appointment.findUnique({
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
        profileDoctor: true,
        profileParent: true,
      },
    });
  }

  async createAppointment(data: Prisma.AppointmentUncheckedCreateInput) {
    return await this.prisma.appointment.create({
      data,
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
        profileDoctor: true,
        profileParent: true,
      },
    });
  }
  async updateAppointment(data: Prisma.AppointmentUncheckedUpdateInput, id: string) {
    return await this.prisma.appointment.update({
      where: {
        id,
      },
      data,
      include: {
        child: {
          select: {
            fullName: true,
            fullNameArabic: true,
            gender: true,
            birthDate: true,
          },
        },
        profileDoctor: true,
        profileParent: true,
      },
    });
  }
  async deleteAppointment(id: string) {
    return await this.prisma.appointment.delete({
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
        profileDoctor: true,
        profileParent: true,
      },
    });
  }

  async getAppointmentForPayment(appointmentId: string, parentId: string) {
    return await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        parentId,
      },
      include: {
        payment: true,
      },
    });
  }
}
//4/13/2026