import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAppointment(where: Prisma.AppointmentWhereInput) {
    return await this.prisma.appointment.findFirst({
      where,
    });
  }
}
