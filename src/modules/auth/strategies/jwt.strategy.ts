import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type jwtpayload = {
  userId: string;
  email: string;
  role: Role;
  parentId?: string;
  iat?: number;
  exp?: number;
};

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow('JWT_SECRET'),
    });
  }

  async validate(payload: jwtpayload) {
    return {
      userId: payload.userId,
      role: payload.role,
    };
  }
}
