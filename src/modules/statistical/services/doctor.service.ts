import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorStatistical } from '../repositories/doctor.repository';
import { DoctorStatus, Gender } from '@prisma/client';

@Injectable()
export class DoctorService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly doctorRepo: DoctorStatistical,
  ) {}


  private async checkUserAndProfileDoctor(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException("user not found");
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
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    const begin = from ? this.parseDate(from, 'from') : this.lastMonthAgo();
    const end = to ? this.parseDate(to, 'to') : new Date();
    return this.doctorRepo.revenue(begin, end, doctorId);
  }

  async todayAppointments(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    return this.doctorRepo.todayAppointments(doctorId);
  }

  async genderDistribution(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    const childForDoctor = this.doctorRepo.countChildForSpecficDoctor(doctorId);

    let male: number = 0;
    let female: number = 0;
    const genderCount = (await childForDoctor).map((a) => {
      if (a.child.gender === Gender.Male) {
        male++;
      } else {
        female++;
      }
      return {
        male: male,
        female: female,
      };
    });
    return { genderCount };
  }

  async bookingLastMonth(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    const lastMonth = this.lastMonthAgo();
    const booking = await this.doctorRepo.allAppointmentsLastMonth(doctorId, lastMonth);
    return booking;
  }

  async totalParent(userId : string){
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    return await this.doctorRepo.totalParent(doctorId)

  }

  async totalPatient(userId : string){
    const doctorId = await this.checkUserAndProfileDoctor(userId)
    return await this.doctorRepo.totalPatient(doctorId)
  }


  
}

