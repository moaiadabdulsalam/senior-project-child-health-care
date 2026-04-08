import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DoctorStatus, WeekDay } from '@prisma/client';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AvailabilityPolicyRepository } from '../repositories/availabilityPolicy.repositories';
import { CreatePolicyDto } from '../dtos/createPolicy.dto';
import strict from 'assert/strict';
import { UpdatePolicyDto } from '../dtos/updatePolicy.dto';

@Injectable()
export class AvailabilityPolicyService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly policyRepo: AvailabilityPolicyRepository,
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
  async getPolicy(userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policyRepo.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('Availability policy not found');
    }
    return policy;
  }

  async createPolicy(dto: CreatePolicyDto, userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const availabilityPolicy = await this.policyRepo.getUniquePolicy(doctorId);
    if (availabilityPolicy) {
      throw new BadRequestException('Availiablity Policy exist');
    }

    const policy = await this.policyRepo.createPolicy({
      profileDoctor: { connect: { id: doctorId } },
      startWork: new Date(dto.startWork),
      endWork: new Date(dto.endWork),
      slot: dto.slot,
      breakStart: dto.breakStart ? new Date(dto.breakStart) : undefined,
      breakEnd: dto.breakEnd ? new Date(dto.breakEnd) : undefined,
      sessionPrice: dto.sessionPrice,
      weeklyOffDays: dto.weeklyOffDays,
    });
    return policy;
  }

  async updatePolicy(dto: UpdatePolicyDto, userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    await this.getPolicy(userId);

    const policy = await this.policyRepo.updatePolicy(
      {
        startWork: dto.startWork ? new Date(dto.startWork) : undefined,
        endWork: dto.endWork ? new Date(dto.endWork) : undefined,
        breakStart: dto.breakStart ? new Date(dto.breakStart) : undefined,
        breakEnd: dto.breakEnd ? new Date(dto.breakEnd) : undefined,
        slot: dto.slot,
        sessionPrice: dto.sessionPrice,
        weeklyOffDays: dto.weeklyOffDays,
      },
      doctorId,
    );

    return policy;
  }

}
