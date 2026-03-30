import { Injectable } from '@nestjs/common';
import { Appointment, Prisma } from '@prisma/client';
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

  async getOneAppointment(id: string): Promise<Appointment | null> {
    return await this.prisma.appointment.findUnique({
      where: {
        id,
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
    });
  }
  async deleteAppointment(id: string) {
    return await this.prisma.appointment.delete({
      where: {
        id,
      },
    });
  }
  async cancelAppointment() {}
}
