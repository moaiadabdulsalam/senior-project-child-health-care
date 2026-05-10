import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { REFRESH_TOKEN_NAME } from '../cookie/config.cookie';

export type ResfreshTokenPayload = {
  userId: string;
  role: Role;
  parentId?: string;
  email: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => {
        const cookieToken = req?.cookies?.[REFRESH_TOKEN_NAME];
        if (typeof cookieToken === 'string' && cookieToken.length > 0) {
          return cookieToken;
        }
        const bodyToken = req?.body?.refreshToken;
        if (typeof bodyToken === 'string' && bodyToken.length > 0) {
          return bodyToken;
        }
        return null;
      },
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: ResfreshTokenPayload) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_NAME] ?? req.body?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      parentId: payload.parentId,
      refreshToken,
    };
  }
}
