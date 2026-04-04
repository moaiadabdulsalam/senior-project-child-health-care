import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';

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
      jwtFromRequest: (req: Request) => req?.cookies?.refreshToken || null,
      secretOrKey: process.env.JWT_REFRESH_SECRET!,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: ResfreshTokenPayload) {
    const refreshToken = req.cookies?.refreshToken;

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
