import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorStatisticalRepository } from '../repositories/doctor.repository';
import { DoctorStatus, Prisma, TypeOfRevenue } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/index-browser';
import { last } from 'rxjs';

@Injectable()
export class DoctorStatisticalService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly doctorRepo: DoctorStatisticalRepository,
  ) {}
  private async checkUserAndProfileDoctor(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const doctorProfile = user.profileDoctory;
    if (!doctorProfile || doctorProfile.status !== DoctorStatus.CONFIRMING) {
      throw new NotFoundException('doctor profile not found');
    }
    return doctorProfile.id;
  }

  private lastMonthAgo() {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    oneMonthAgo.setHours(0, 0, 0, 0);
    return oneMonthAgo;
  }

  private lastWeekAgo() {
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 5);
    oneWeekAgo.setHours(0, 0, 0, 0);
    return oneWeekAgo;
  }

  private lastWeekRevenue(doctorId: string) {
    const now = new Date();
    const lastWeek = this.lastWeekAgo();
    return this.doctorRepo.revenuePerDate(lastWeek, now, doctorId);
  }

  // private parseDate(value: string, fieldName: string): Date {
  //   const date = new Date(value);
  //   if (Number.isNaN(date.getTime())) {
  //     throw new BadRequestException(`${fieldName} is not a valid date`);
  //   }
  //   return date;
  // }

  async revenues(userId: string, date?: Date, type?: TypeOfRevenue) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);

    if (date) {
      const targetStartDate = new Date(date);
      targetStartDate.setHours(0, 0, 0, 0);
      const targetEndDate = new Date(date);
      targetEndDate.setHours(23, 59, 59, 999);
      const result = await this.doctorRepo.revenuePerDate(targetStartDate, targetEndDate, doctorId);
      return {
        date,
        revenue: result._sum.amount ?? new Prisma.Decimal(0),
      };
    }

    let rev: { date: Date; revenue: Decimal }[] = [];

    if (type === TypeOfRevenue.WEEKLY || (!date && !type)) {
      
      const lastWeek = this.lastWeekAgo();

      for (let i = 0; i < 7; i++) {
        const start = new Date(lastWeek)
        start.setDate(lastWeek.getDate() + i);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
  
        const result = await this.doctorRepo.revenuePerDate(start, end, doctorId);
        if (result._sum.amount === null) {
          result._sum.amount = Prisma.Decimal(0);
        }
        rev.push({ date: start, revenue: result._sum.amount ?? new Prisma.Decimal(0)});
      }
      return rev;
    }

    if (type === TypeOfRevenue.MONTHLY) {
      
      const revenue: { label: string; revenue: Decimal }[] = [];
      const currentYear = new Date().getFullYear();
  
      for (let month = 0; month < 12; month++) {
        const start = new Date(currentYear, month, 1);
        start.setHours(0, 0, 0, 0);
  
        const end = new Date(currentYear, month + 1, 0);
        end.setHours(23, 59, 59, 999);
  
        const result = await this.doctorRepo.revenuePerDate(start, end, doctorId);
  
        revenue.push({
          label: start.toLocaleString('en-US', { month: 'long' }),
          revenue: result._sum.amount ?? new Prisma.Decimal(0),
        });
      }
  
      return revenue;
    }
    if (type === TypeOfRevenue.YEARLY) {
      const revenue: { label: string; revenue: Decimal }[] = [];

      const firstRevenueDate = await this.doctorRepo.findFirstRevenueDate(doctorId);
      const currentYear = new Date().getFullYear();
  
      if (!firstRevenueDate) {
        return [];
      }
  
      const startYear = firstRevenueDate.getFullYear();
  
      for (let year = startYear; year <= currentYear; year++) {
        const start = new Date(year, 0, 1);
        start.setHours(0, 0, 0, 0);
  
        const end = new Date(year, 11, 31);
        end.setHours(23, 59, 59, 999);
  
        const result = await this.doctorRepo.revenuePerDate(start, end, doctorId);
  
        revenue.push({
          label: String(year),
          revenue: result._sum.amount ?? new Prisma.Decimal(0),
        });
      }
  
      return revenue;
    }
  }

  async todayAppointments(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    return this.doctorRepo.todayAppointments(doctorId);
  }

  async bookingLastMonth(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const lastMonth = this.lastMonthAgo();
    const booking = await this.doctorRepo.allAppointmentsLastMonth(doctorId, lastMonth);
    return booking;
  }

  async totalParent(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    return await this.doctorRepo.totalParent(doctorId);
  }

  async totalPatient(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    return await this.doctorRepo.totalPatient(doctorId);
  }

  /** Mean age in years of distinct children seen in completed appointments; null if none. */
  async averagePatientAge(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    return this.doctorRepo.averagePatientAgeYears(doctorId);
  }
  
}
