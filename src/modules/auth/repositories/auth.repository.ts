import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

type RegisterUserInfoResult = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    role: true;
    createdAt: true;
    updatedAt: true;
    isActive: true;
  };
}>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerUserInfo(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<RegisterUserInfoResult> {
    const client = tx ?? this.prisma;

    return client.user.create({
      data,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        isActive: true,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  async updateUserPassword(id: string, data: string) {
    await this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
