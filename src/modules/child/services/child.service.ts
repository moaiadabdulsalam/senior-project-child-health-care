import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChildRepository } from '../repositories/child.repository';
import { CreateChildDto } from '../dtos/createChild.dto';
import { UpdateChildDto } from '../dtos/updateChild.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { UploadService } from 'src/modules/upload/services/upload.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChildService {
  constructor(
    private childRepo: ChildRepository,
    private readonly userRepo: AuthRepository,
    private readonly uploadService: UploadService,
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

  async getById(id: string, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const child = await this.childRepo.getChildForSpecficParent(id, parentId);
    if (!child) {
      throw new NotFoundException('Child Not Found');
    }
    return child;
  }

  async createChild(dto: CreateChildDto, userId: string, file?: Express.Multer.File) {
    const parentId = await this.checkUserAndProfileParent(userId);
    let imageDate: { key: string; url: string } | null = null;
    if (file) {
      imageDate = await this.uploadService.uploadImage(file);
    }
    try {
      return await this.childRepo.createChild({
        fullName: dto.fullName,
        fullNameArabic: dto.fullNameArabic ?? undefined,
        gender: dto.gender,
        birthDate: dto.birthDate,
        bloodType: dto.bloodType ?? undefined,
        loginHandle: dto.loginHandle,
        isActive: true,
        role: Role.CHILD,
        profileParent: {
          connect: {
            id: parentId,
          },
        },
        ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('Child full name already exists');
      }
    }
  }

  async updateChild(dto: UpdateChildDto, userId: string, id: string, file?: Express.Multer.File) {
    const parentId = await this.checkUserAndProfileParent(userId);
    await this.getById(id, userId);
    let imageDate: { key: string; url: string } | null = null;
    if (file) {
      imageDate = await this.uploadService.uploadImage(file);
    }
    try {
      return await this.childRepo.updateChild(id, {
        fullName: dto.fullName ?? undefined,
        fullNameArabic: dto.fullNameArabic ?? undefined,
        gender: dto.gender ?? undefined,
        birthDate: dto.birthDate ?? undefined,
        bloodType: dto.bloodType ?? undefined,
        loginHandle: dto.loginHandle ?? undefined,
        ...(imageDate ? { imageKey: imageDate.key, imageUrl: imageDate.url } : {}),
      });
    } catch (e) {
      if (e.code === 'P2002') {
        throw new BadRequestException('full name is already exit');
      }
    }
  }
  async deleteChild(userId: string, id: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    await this.getById(id, userId);
    return await this.childRepo.deleteChild(id);
  }
}
