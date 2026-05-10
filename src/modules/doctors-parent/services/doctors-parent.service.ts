import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { DoctorsParentRepository } from '../repositories/doctorsParent.repositories';

@Injectable()
export class DoctorsParentService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly drParentRepo: DoctorsParentRepository,
  ) {}
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

  async getAllDoctors(userId: string, page: number, limit: number, search?: string) {
    await this.checkUserAndProfileParent(userId);

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;
    const tokens = (search ?? '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 8);

    const profileSearchWhere: Prisma.ProfileDoctorWhereInput =
      tokens.length > 0
        ? {
            AND: tokens.map((token) => ({
              OR: [
                { fullName: { contains: token, mode: 'insensitive' } },
                { fullNameArabic: { contains: token, mode: 'insensitive' } },
                { speciality: { contains: token, mode: 'insensitive' } },
                { specialityArabic: { contains: token, mode: 'insensitive' } },
                { clinicName: { contains: token, mode: 'insensitive' } },
                { clinicNameArabic: { contains: token, mode: 'insensitive' } },
              ],
            })),
          }
        : {};

    const where: Prisma.UserWhereInput = {
      isActive: true,
      role: Role.DOCTOR,
      profileDoctory: profileSearchWhere,
    };

    const data = await this.drParentRepo.getAllDoctors(where, skip, limit);
    const count = await this.drParentRepo.count(where);
    return {
      data,
      meta: {
        page,
        limit,
        count,
        skip,
        pageTotal: Math.ceil(count / limit),
      },
    };
  }
  async getOne(userId: string, id: string) {
    await this.checkUserAndProfileParent(userId);
    const doctor = await this.drParentRepo.getOne(id);
    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }
    return doctor;
  }
}
