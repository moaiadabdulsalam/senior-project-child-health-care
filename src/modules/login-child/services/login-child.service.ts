import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoginChildRepository } from '../repositories/LoginChild.repository';
import { AccessSessionStatus, Prisma, Role } from '@prisma/client';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { ExtendChildSessionDto } from '../dtos/extendSession.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoginChildService {
  constructor(
    private readonly loginChildRepo: LoginChildRepository,
    private readonly userRepo: AuthRepository,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

  async signAccessToken(sessionId: string, childId: string, expiresAt: Date) {
    if (!sessionId) {
      throw new BadRequestException('Invalid session data for token generation');
    }
    if (!childId) {
      throw new NotFoundException('Child not found for this parentd');
    }
    const secret = this.config.get('JWT_LOGIN_CHILD');
    if (!secret) {
      throw new BadRequestException('Missing secret key');
    }
    const payload = {
      childId: childId,
      sessionId: sessionId,
      role: Role.CHILD,
    };

    const now = Date.now();
    const diffMs = expiresAt.getTime() - now;

    if (diffMs <= 0) {
      throw new BadRequestException('Session already expired');
    }

    const expiresInSeconds = Math.floor(diffMs / 1000);
    const accessToken = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: expiresInSeconds,
    });

    return accessToken;
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
  async endSession(id: string, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const where: Prisma.ChildAccessSessionWhereInput = {
      id,
    };
    const session = await this.loginChildRepo.getSessionById(where);
    if (!session || session.parentId !== parentId) {
      throw new NotFoundException('session not found');
    }
    const isActive = session.status === AccessSessionStatus.ACTIVE ? true : false;
    if (!isActive) {
      throw new BadRequestException('session already unActive');
    }

    return await this.loginChildRepo.updateOne(id, {
      status: AccessSessionStatus.REVOKED,
      endedAt: new Date(),
    });
  }

  async extendChildSession(id: string, dto: ExtendChildSessionDto, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);

    const where: Prisma.ChildAccessSessionWhereInput = {
      id,
    };
    const session = await this.loginChildRepo.getSessionById(where);

    if (!session || session.parentId !== parentId) {
      throw new NotFoundException('Session not found');
    }

    if (session.status !== AccessSessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    if (new Date() > session.expiresAt) {
      throw new BadRequestException('Session already expired');
    }

    const newExpireAt = new Date(session.expiresAt.getTime() + dto.extraMinutes * 60 * 1000);

    const updatedSession = await this.loginChildRepo.updateOne(id, {
      expiresAt: newExpireAt,
      durationMinutes: session.durationMinutes + dto.extraMinutes,
    });

    const accessToken = await this.signAccessToken(id, session.childId, newExpireAt);

    return {
      accessToken,
      session: updatedSession,
    };
  }

  async getAllSessionForSpecficParent(
    userId: string,
    page: number,
    limit: number,
    status?: AccessSessionStatus,
    childId?: string,
  ) {
    const parentId = await this.checkUserAndProfileParent(userId);
    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;
    const where: Prisma.ChildAccessSessionWhereInput = {
      parentId,
      ...(status && { status }),
      ...(childId && { childId }),
    };

    const count = await this.loginChildRepo.count(where);
    const data = await this.loginChildRepo.getAllAccessSession(where, skip, limit);
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
}
