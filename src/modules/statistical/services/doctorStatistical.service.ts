import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorStatisticalRepository } from '../repositories/doctor.repository';
import { DoctorStatus } from '@prisma/client';

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

  private parseDate(value: string, fieldName: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${fieldName} is not a valid date`);
    }
    return date;
  }

  async revenue(userId: string, from?: string, to?: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const begin = from ? this.parseDate(from, 'from') : this.lastMonthAgo();
    const end = to ? this.parseDate(to, 'to') : new Date();
    return this.doctorRepo.revenue(begin, end, doctorId);
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
}
