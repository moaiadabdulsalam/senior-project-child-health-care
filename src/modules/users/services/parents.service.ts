import { Injectable, NotFoundException } from '@nestjs/common';
import { ParentsRepository } from '../repositories/parents.repository';
import { UpdateActivityDto } from '../dto/updateActivity.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { Role } from '@prisma/client';
import { AuthService } from 'src/modules/auth/services/auth.service';

@Injectable()
export class ParentsService {
  constructor(
    private readonly parentsRepo: ParentsRepository,
    private readonly userRepo: AuthRepository,
    private readonly authService: AuthService,
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

    const isActive = dto.isActive;

    const subject = isActive
      ? 'Your account has been reactivated'
      : 'Your account has been deactivated';

    const html = isActive
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>Hello Mr. ${parent.profileParent?.fullName ?? ''}</h2>
          <p>Your account has been reactivated by the admin.</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>Hello Mr. ${parent.profileParent?.fullName ?? ''}</h2>
          <p>Your account has been deactivated by the admin.</p>
        </div>
      `;
    try {
      await this.authService.sendToEmail(parent.email, html, subject);
    } catch (error) {
      console.error('Failed to send doctor activity email:', error);
    }
    return {
      message: 'updated user successfully',
    };
  }
}
