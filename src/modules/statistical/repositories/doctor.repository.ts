import { Injectable } from '@nestjs/common';
import { Appointment, AppointmentStatus, Gender, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

type AppointmentWithRelation = Prisma.AppointmentGetPayload<{
  include: {
    child: true;
    profileParent: true;
  };
}>;
type AppointmentWithRelationChild = Prisma.AppointmentGetPayload<{
  include: {
    child: true;
  
  };
}>;
@Injectable()
export class DoctorStatistical {
  constructor(private readonly prisma: PrismaService) {}

  async revenue(from: Date, to: Date, doctorId: string) {
    return await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        doctorId,
        paidAt: {
          gte: from,
          lte: to,
        },
      },
    });
  }

  async todayAppointments(doctorId: string) :Promise<Appointment[]>{
    return await this.prisma.appointment.findMany({
      where: {
        doctorId,
      },
    });
  }

  async countChildForSpecficDoctor(doctorId: string) :Promise <AppointmentWithRelationChild[]> {
    return await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      include: {
        child: true,
      },
    });
  }

  async allAppointmentsLastMonth(doctorId: string, lastMonth: Date) : Promise<AppointmentWithRelation[]> {
    return await this.prisma.appointment.findMany({
      where: {
        doctorId,
        createdAt: {
          gte: lastMonth,
          lte: new Date(),
        },
      },
      include: {
        child: true,
        profileParent: true,
      },
    });
  }

  async totalParent(doctorId: string):Promise<number> {
    const total = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      distinct: ['parentId'],
    });

    return total.length;
  }

  async totalPatient(doctorId: string):Promise<number> {
    const total = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      distinct: ['childId'],
    });
    return total.length
  }
}
