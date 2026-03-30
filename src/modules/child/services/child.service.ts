import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChildRepository } from '../repositories/child.repository';
import { CreateChildDto } from '../dtos/createChild.dto';
import { UpdateChildDto } from '../dtos/updateChild.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChildService {
  constructor(
    private childRepo: ChildRepository,
    private readonly userRepo: AuthRepository,
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
  async getAll(userId: string, page: number, limit: number, search?: string) {
    const parentId = await this.checkUserAndProfileParent(userId);

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ChildWhereInput = {
      parentId,
      ...(search && {
        fullName: {
          contains: search,
          mode: 'insensitive',
        },
      }),
    };
    const count = await this.childRepo.count(where);
    const data = await this.childRepo.getAll(where, skip, limit);
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

  async getById(id: string) {
    const child = await this.childRepo.findById(id);
    if (!child) {
      throw new NotFoundException('Child Not Found');
    }
    return child;
  }

  async createChild(dto: CreateChildDto, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    try {
      return await this.childRepo.createChild({
        fullName: dto.fullName,
        fullNameArabic: dto.fullNameArabic ?? undefined,
        gender: dto.gender,
        birthDate: dto.birthDate,
        bloodType: dto.birthDate ?? undefined,
        loginHandle: dto.loginHandle,
        photo: dto.photo,
        isActive: true,
        role: Role.CHILD,
        profileParent: {
          connect: {
            id: parentId,
          },
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('full name is already exit');
      }
    }
  }

  async updateChild(dto: UpdateChildDto, userId: string, id: string) {
    await this.getById(id);
    await this.checkUserAndProfileParent(userId);
    try {
      return await this.childRepo.updateChild(id, {
        fullName: dto.fullName ?? undefined,
        fullNameArabic: dto.fullNameArabic ?? undefined,
        gender: dto.gender ?? undefined,
        birthDate: dto.birthDate ?? undefined,
        bloodType: dto.birthDate ?? undefined,
        loginHandle: dto.loginHandle ?? undefined,
        photo: dto.photo ?? undefined,
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('full name is already exit');
      }
    }
  }
  async deleteChild(userId: string, id: string) {
    await this.getById(id);
    await this.checkUserAndProfileParent(userId);
    return await this.childRepo.deleteChild(id);
  }
}
