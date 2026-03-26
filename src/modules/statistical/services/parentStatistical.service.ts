import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ParentStatisticalRepository } from '../repositories/parent.repository';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AppointmentRepository } from 'src/modules/appointment/repositories/appointment.repository';
import { AppointmentStatus, Prisma } from '@prisma/client';

@Injectable()
export class ParentStatisticalService {
  constructor(
    private readonly parentRepo: ParentStatisticalRepository,
    private readonly userRepo: AuthRepository,
    private readonly AppointmentRepo: AppointmentRepository,
  ) {}
  private async checkUserAndProfileParent(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const parentProfile = user.profileParent;
    if (!parentProfile) {
      throw new NotFoundException('doctor profile not found');
    }

    return parentProfile.id;
  }

  private calculateAge(birthDate: Date) {
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }
    if (months < 0) {
      months += 12;
      years--;
    }
    return {
      years,
      months,
      days,
    };
  }

  async getPhotoWithAge(userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const ids = await this.parentRepo.allChildsForSpecficParent(parentId);

    const totalChildPhotoAndAge = await Promise.all(
      ids.map(async (ch) => {
        const child = await this.parentRepo.getPhoto(ch.id);
        const childAge = child?.birthDate;

        if (!childAge) {
          throw new BadGatewayException('please enter the age');
        }
        const age = this.calculateAge(childAge);
        return {
          id: child.id,
          photo: child.photo,
          age,
        };
      }),
    );
    return totalChildPhotoAndAge;
  }
  async totalGames(userId: string, date?: Date) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const ids = await this.parentRepo.allChildsForSpecficParent(parentId);

    const targetDate = date ?? new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const totalGamesForEveryChild = await Promise.all(
      ids.map(async (child) => {
        const games = await this.parentRepo.getGames(child.id, start, end);
        return {
          childId: child.id,
          games: games,
          totalGames: games.length,
        };
      }),
    );
    return totalGamesForEveryChild;
  }

  async totalAppointments(userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const ids = await this.parentRepo.allChildsForSpecficParent(parentId);
    const totalAppointmentsForEveryChild = await Promise.all(
      ids.map(async (child) => {
        let where: Prisma.AppointmentWhereInput = {
          childId: child.id,
          status: AppointmentStatus.RESERVED,
        };
        const appointments = await this.AppointmentRepo.getAppointment(where);
        return {
          totalAppointments: appointments.length,
          appointment: appointments,
        };
      }),
    );
    return totalAppointmentsForEveryChild;
  }

  async getMedication(userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const ids = await this.parentRepo.allChildsForSpecficParent(parentId);
    const totalMedications = await Promise.all(
      ids.map(async (child) => {
        const medication = await this.parentRepo.getMedications(child.id);
        return medication;
      }),
    );
    return totalMedications;
  }
}
