import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProfileRepository } from '../repositories/Profile.repositories';
import { UpdateDoctorProfileDto } from '../dtos/updateDoctorProfile.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorStatus, Role } from '@prisma/client';
import { UpdateParentProfileDto } from '../dtos/updateParentProfile.dto';
import { ChangePasswordDto } from '../dtos/changePass.dto';
import * as bcrypt from 'bcrypt';
import { UploadService } from 'src/modules/upload/services/upload.service';
import { RequireUpdateProfileDoctorDto } from '../dtos/requireUpdateDoctorProfile.dto';
@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepo: ProfileRepository,
    private readonly userRepo: AuthRepository,
    private readonly uploadService: UploadService,
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

  private async checkUserAndProfileParent(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const parentProfile = user.profileParent;
    if (!parentProfile || user.role !== Role.PARENT) {
      throw new NotFoundException('parent profile not found');
    }

    return parentProfile.id;
  }

  async updateDoctorProfile(
    userId: string,
    dto: UpdateDoctorProfileDto,
    files: {
      image?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);

    let imageDate: { key: string; url: string } | null = null;
    if (files.image?.length) {
      imageDate = await this.uploadService.uploadImage(files.image[0]);
    }
    if (files.image?.[0] && files.image[0].size > 5_000_000) {
      throw new BadRequestException('Image too large');
    }

    let certificateDate: { key: string; url: string } | null = null;
    if (files.certificates?.length) {
      certificateDate = await this.uploadService.uploadImage(files.certificates[0]);
    }
    if (files.certificates?.[0] && files.certificates[0].size > 5_000_000) {
      throw new BadRequestException('Image too large');
    }

    return await this.profileRepo.updateDoctor(doctorId, {
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
      ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
      ...(certificateDate
        ? { certificateKey: certificateDate.key, certificateUrl: certificateDate.url }
        : {}),
    });
  }

  async updateParentProfile(
    userId: string,
    dto: UpdateParentProfileDto,
    file?: Express.Multer.File,
  ) {
    const parentId = await this.checkUserAndProfileParent(userId);
    let imageDate: { key: string; url: string } | null = null;
    if (file) {
      imageDate = await this.uploadService.uploadImage(file);
    }
    return await this.profileRepo.updateParent(parentId, {
      fullName: dto.fullName ?? undefined,
      fullNameArabic: dto.fullNameArabic ?? undefined,
      address: dto.address ?? undefined,
      addressArabic: dto.addressArabic ?? undefined,
      phone: dto.phone ?? undefined,
      ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
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
    await this.profileRepo.changePassword(userId, hashNewPassword);
    return {
      message: 'reset password successfuly',
    };
  }

  async requireUpdateDoctorProfile(
    userId: string,
    dto: RequireUpdateProfileDoctorDto,
    files: {
      image?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.role !== Role.DOCTOR) {
      throw new BadRequestException('Only doctors can complete this profile');
    }

    if (user.profileDoctory) {
      throw new BadRequestException('Doctor profile already exists');
    }

    let imageDate: { key: string; url: string } | null = null;
    if (files.image?.length) {
      imageDate = await this.uploadService.uploadImage(files.image[0]);
    }

    if (files.image?.[0] && files.image[0].size > 5_000_000) {
      throw new BadRequestException('Image too large');
    }
    let certificateDate: { key: string; url: string } | null = null;
    if (files.certificates?.length) {
      certificateDate = await this.uploadService.uploadImage(files.certificates[0]);
    }
    if (files.certificates?.[0] && files.certificates[0].size > 5_000_000) {
      throw new BadRequestException('Image too large');
    }

    const profileDoctor = await this.profileRepo.createProfileDoctor({
      speciality: dto.speciality,
      specialityArabic: dto.specialityArabic ?? undefined,
      clinicAddress: dto.clinicAddress ?? undefined,
      clinicNameArabic: dto.clinicNameArabic ?? undefined,
      clinicPhone: dto.clinicPhone ?? undefined,
      clinicName: dto.clinicName ?? undefined,
      clinicAddressArabic: dto.clinicAddressArabic ?? undefined,
      fullName: dto.fullName,
      fullNameArabic: dto.fullNameArabic ?? undefined,
      status: DoctorStatus.VERIFYING,
      description: dto.description ?? undefined,
      phone: dto.phone,
      user: {
        connect: { id: user.id },
      },
      ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
      ...(certificateDate
        ? { certificateKey: certificateDate.key, certificateUrl: certificateDate.url }
        : {}),
    });

    await this.userRepo.updateUserInfo(userId, { isProfileCompleted: true });
    return profileDoctor;
  }
}
