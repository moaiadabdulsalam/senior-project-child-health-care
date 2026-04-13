import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginChildRepository } from '../repositories/LoginChild.repository';
import { AccessSessionStatus, Prisma, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChildAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loginChildRepo: LoginChildRepository,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing child access token');
    }

    const token = authHeader.split(' ')[1];

    let payload: {
      childId: string;
      sessionId: string;
      role: Role;
    };

    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_LOGIN_CHILD'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.role !== Role.CHILD) {
      throw new UnauthorizedException('only for child');
    }

    const where : Prisma.ChildAccessSessionWhereInput = {
      id : payload.sessionId
    }
    const session = await this.loginChildRepo.getSessionById(where);

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.status !== AccessSessionStatus.ACTIVE) {
      throw new UnauthorizedException('Session inactive');
    }

    if (session.childId !== payload.childId) {
      throw new UnauthorizedException('Session child mismatch');
    }

    if (new Date() > session.expiresAt) {
      if (session.status === AccessSessionStatus.ACTIVE) {
        const where: Prisma.ChildAccessSessionWhereInput = {
          id: session.id,
          status: AccessSessionStatus.ACTIVE,
        };
        await this.loginChildRepo.updateManyToExpire(
          {
            status: 'EXPIRED',
            endedAt: new Date(),
          },
          where,
        );
      }
      throw new UnauthorizedException('Session expired');
    }

    request.childAccess = {
      childId: session.childId,
      sessionId: session.id,
      parentId: session.parentId,
      expiresAt: session.expiresAt,
    };

    return true;
  }
}
