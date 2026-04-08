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
export class DoctorStatisticalRepository {
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

  async todayAppointments(doctorId: string): Promise<Appointment[]> {
    return await this.prisma.appointment.findMany({
      where: {
        doctorId,
      },
    });
  }

  async countChildForSpecficDoctor(doctorId: string): Promise<AppointmentWithRelationChild[]> {
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

  async allAppointmentsLastMonth(
    doctorId: string,
    lastMonth: Date,
  ): Promise<AppointmentWithRelation[]> {
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

  async totalParent(doctorId: string): Promise<number> {
    const total = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      distinct: ['parentId'],
    });

    return total.length;
  }

  async totalPatient(doctorId: string): Promise<number> {
    const total = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      distinct: ['childId'],
    });
    return total.length;
  }

  /** Average age in full years at "now" for distinct children in completed appointments. */
  async averagePatientAgeYears(doctorId: string): Promise<{
    averageYears: number | null;
    patientCount: number;
  }> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: AppointmentStatus.COMPLETED,
      },
      distinct: ['childId'],
      select: {
        childId: true,
        child: { select: { birthDate: true } },
      },
    });
    const birthDates = rows
      .map((r) => r.child?.birthDate)
      .filter((d): d is Date => d instanceof Date);
    if (birthDates.length === 0) {
      return { averageYears: null, patientCount: 0 };
    }
    const now = new Date();
    const agesYears = birthDates.map((bd) => {
      let years = now.getFullYear() - bd.getFullYear();
      const m = now.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < bd.getDate())) years--;
      return years;
    });
    const sum = agesYears.reduce((a, b) => a + b, 0);
    return {
      averageYears: Math.round((sum / agesYears.length) * 10) / 10,
      patientCount: agesYears.length,
    };
  }
}
