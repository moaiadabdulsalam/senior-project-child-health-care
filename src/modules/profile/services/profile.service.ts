import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/Profile.repositories';
import { UpdateDoctorProfileDto } from '../dtos/updateDoctorProfile.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorStatus } from '@prisma/client';
import { UpdateParentProfileDto } from '../dtos/updateParentProfile.dto';
import { ChangePasswordDto } from '../dtos/changePass.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class ProfileService {
  constructor(
    private readonly doctorRepo: ProfileRepository,
    private readonly userRepo: AuthRepository,
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

  async updateDoctorProfile(userId: string, dto: UpdateDoctorProfileDto) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);

    return await this.doctorRepo.updateDoctor(doctorId, {
      fullName: dto.fullName ?? undefined,
      fullNameArabic: dto.fullNameArabic ?? undefined,
      speciality: dto.speciality ?? undefined,
      specialityArabic: dto.specialityArabic ?? undefined,
      description: dto.description ?? undefined,
      phone: dto.phone ?? undefined,
      clinicName: dto.clinicName ?? undefined,
      clinicNameArabic: dto.clinicNameArabic ?? undefined,
      clinicAddress: dto.clinicAddress ?? undefined,
      clinicAddressArabic: dto.clinicAddressArabic ?? undefined,
      clinicPhone: dto.clinicPhone ?? undefined,
      status: dto.status ?? undefined,
    });
  }

  async updateParentProfile(userId: string, dto: UpdateParentProfileDto) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    return await this.doctorRepo.updateParent(doctorId, {
      fullName: dto.fullName ?? undefined,
      fullNameArabic: dto.fullNameArabic ?? undefined,
      address: dto.address ?? undefined,
      addressArabic: dto.addressArabic ?? undefined,
      phone: dto.phone ?? undefined,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    await this.checkUserAndProfileDoctor(userId);
    const user = await this.userRepo.findUserById(userId);

    if (dto.ConfirmPassword !== dto.newPassword) {
      throw new BadRequestException('passwords you entered do not match');
    }
    const compare = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!compare) {
      throw new BadRequestException('incorrect old password');
    }

    const hashNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.doctorRepo.changePassword(userId, hashNewPassword);
    return {
      message: 'reset password successfuly',
    };
  }
}
