import { Injectable, NotFoundException } from '@nestjs/common';
import { ParentsRepository } from '../repositories/parents.repository';
import { UpdateActivityDto } from '../dto/updateActivity.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { Role } from '@prisma/client';

@Injectable()
export class ParentsService {
  constructor(
    private readonly parentsRepo: ParentsRepository,
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

  async getAllUserParent() {
    return this.parentsRepo.getAllUserParent();
  }

  async getChildsForSpecficParent(id: string) {
    const parent = await this.parentsRepo.getParent(id);
    if (!parent) {
      throw new NotFoundException('parent not found');
    }
    const parentId = await this.checkUserAndProfileParent(id);
    return await this.parentsRepo.getChildsForSpecficParent(parentId);
  }

  async updateParentUserActivity(id: string, dto: UpdateActivityDto) {
    const parent = await this.parentsRepo.getParent(id);
    if (!parent) {
      throw new NotFoundException('parent not found');
    }
    const parentId = await this.checkUserAndProfileParent(id);
    const childs = await this.parentsRepo.getChildsForSpecficParent(parentId);
    const childIds = childs.map((ids) => ids.id);
    if (childIds.length < 1) {
      throw new NotFoundException('no child exist');
    }
    await this.parentsRepo.updateAccountParentAndChildsActivity(id, dto.isActive, childIds);
    return {
      message: 'updated user successfully',
    };
  }
}
