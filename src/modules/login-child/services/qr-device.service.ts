import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginChildRepository } from '../repositories/LoginChild.repository';
import { LoginChildDto } from '../dtos/loginChild.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import {
  AccessSessionSource,
  AccessSessionStatus,
  DeviceLinkRequest,
  DeviceLinkStatus,
  Prisma,
  Role,
} from '@prisma/client';
import { ChildRepository } from 'src/modules/child/repositories/child.repository';
import { LoginChildService } from './login-child.service';
import { ConsumeQrDto } from '../dtos/consumeQr.dto';
import { ConfigService } from '@nestjs/config';
import { DeviceLinkRepository } from '../repositories/deviceLink.repository';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrDeviceService {
  constructor(
    private readonly loginChildRepo: LoginChildRepository,
    private readonly userRepo: AuthRepository,
    private readonly childRepo: ChildRepository,
    private readonly loginChildService: LoginChildService,
    private readonly config: ConfigService,
    private readonly deviceRepo: DeviceLinkRepository,
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

  async createQr(dto: LoginChildDto, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);

    if (dto.durationMinutes < 5 || dto.durationMinutes > 180) {
      throw new BadRequestException('Duration must be between 5 - 180');
    }
    const child = await this.childRepo.getChildForSpecficParent(dto.childId, parentId);
    if (!child) {
      throw new NotFoundException('Child not found for this parent');
    }

    if (child.loginHandle !== dto.loginHandle) {
      throw new BadRequestException('Wrong LoginHandle');
    }

    const rawToken = uuidv4();
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.deviceRepo.createLink({
      childId: child.id,
      parentId: child.parentId,
      durationMinutes: dto.durationMinutes,
      tokenHash,
      expiresAt,
      status: DeviceLinkStatus.PENDING,
    });

    return {
      qrUrl: `${this.config.get('APP_URL')}/child/connect?token=${rawToken}`,
      expiresAt,
    };
  }

  async QrConsume(dto: ConsumeQrDto) {
    const pendingLinks = await this.deviceRepo.findPendingDevices();
    
    let link: DeviceLinkRequest | null = null;

    for (const item of pendingLinks) {
      if (new Date() > item.expiresAt) {
        await this.deviceRepo.update(item.id, {
          status: DeviceLinkStatus.EXPIRED,
        });
        continue;
      }
      const isValid = await bcrypt.compare(dto.token, item.tokenHash);

      if (isValid) {
        link = item;
        break;
      }
    }

    if (!link) {
      throw new NotFoundException('Invalid QR');
    }

    if (link.status !== DeviceLinkStatus.PENDING) {
      throw new BadRequestException('QR already used');
    }

    await this.expireOldSessions(link.childId);

    const durationMinutes = link.durationMinutes;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
    const createdFrom = AccessSessionSource.QR_DEVICE;
    const childId = link.childId;
    const parentId = link.parentId;
    const childAccessSession = await this.loginChildRepo.CreateChildAccessSession({
      childId,
      parentId,
      durationMinutes,
      startedAt,
      expiresAt,
      createdFrom,
    });

    await this.deviceRepo.update(link.id, {
      status: DeviceLinkStatus.USED,
      usedAt: new Date(),
    });

    const accessToken = await this.loginChildService.signAccessToken(
      childAccessSession.id,
      childAccessSession.childId,
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
