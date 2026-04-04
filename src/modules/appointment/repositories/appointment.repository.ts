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
        child: true,
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

  async getOneAppointment(id: string) {
    return await this.prisma.appointment.findUnique({
      where: {
        id,
      },
      include: {
        profileDoctor: true,
        profileParent: true,
      },
    });
  }

  async createAppointment(data: Prisma.AppointmentUncheckedCreateInput) {
    return await this.prisma.appointment.create({
      data,
    });
  }
  async updateAppointment(data: Prisma.AppointmentUncheckedUpdateInput, id: string) {
    return await this.prisma.appointment.update({
      where: {
        id,
      },
      data,
      include: {
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
