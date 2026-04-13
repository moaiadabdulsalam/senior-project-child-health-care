import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginChildDto } from '../dtos/loginChild.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AccessSessionSource, AccessSessionStatus, Prisma, Role } from '@prisma/client';
import { ChildService } from 'src/modules/child/services/child.service';
import * as bcrypt from 'bcrypt';
import { LoginChildRepository } from '../repositories/LoginChild.repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ChildRepository } from 'src/modules/child/repositories/child.repository';
import { LoginChildService } from './login-child.service';

@Injectable()
export class SameDeviceService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly loginChildRepo: LoginChildRepository,
    private readonly loginChildService: LoginChildService,
    private readonly childRepo: ChildRepository,
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

  private async expireOldSessions(childId: string) {
    const now = new Date();
    const where: Prisma.ChildAccessSessionWhereInput = {
      childId,
      status: AccessSessionStatus.ACTIVE,
    };
    await this.loginChildRepo.updateManyToExpire(
      { status: AccessSessionStatus.EXPIRED, endedAt: now },
      where,
    );
  }

  async sameDeviceLogin(dto: LoginChildDto, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const child = await this.childRepo.getChildForSpecficParent(dto.childId, parentId);
    if (!child) {
      throw new NotFoundException('Child not found for this parent');
    }

    if (child.loginHandle !== dto.loginHandle) {
      throw new BadRequestException('Wrong LoginHandle');
    }

    if (dto.durationMinutes < 5 || dto.durationMinutes > 180) {
      throw new BadRequestException('Duration must be between 5 - 180');
    }
    const durationMinutes = dto.durationMinutes;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    const createdFrom = AccessSessionSource.SAME_DEVICE;
    const childId = dto.childId;
    await this.expireOldSessions(childId);

    const childAccessSession = await this.loginChildRepo.CreateChildAccessSession({
      childId,
      parentId,
      durationMinutes,
      startedAt,
      expiresAt,
      createdFrom,
    });

    const accessToken = await this.loginChildService.signAccessToken(
      childAccessSession.id,
      childId,
      expiresAt,
    );

    return {
      accessToken,
      session: {
        id: childAccessSession.id,
        childId: childAccessSession.childId,
        startedAt: childAccessSession.startedAt,
        expiresAt: childAccessSession.expiresAt,
        durationMinutes: childAccessSession.durationMinutes,
        status: childAccessSession.status,
      },
    };
  }
}
