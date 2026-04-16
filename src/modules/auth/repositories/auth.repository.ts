import { Injectable } from '@nestjs/common';
import { Prisma, ProfileDoctor, ProfileParent, User } from '@prisma/client';
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
        isProfileCompleted :true
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        isActive: true,
        isProfileCompleted :true
      },
      include: {
        profileDoctory: true,
        profileParent: true,
      },
    });
  }

  async findAllUsers(where : Prisma.UserWhereInput) {
    return this.prisma.user.findMany({ where, select: { id: true } });
  }
  async findUserById(userId: string): Promise<User | any> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
        isProfileCompleted :true
      },
      include: {
        profileDoctory: true,
        profileParent: true,
      },
    });
  }
  async updateUserPassword(id: string, data: string) {
    await this.prisma.user.update({
      where: { id, isActive: true },
      data,
    });
  }

  async updateUserRefreshToken(id: string, newRefreshToken: string | null) {
    await this.prisma.user.update({
      where: { id, isActive: true },
      data: {
        hashedRefreshToken: newRefreshToken,
      },
    });
  }

  async updateUserInfo(id: string , data : Prisma.UserUpdateInput){
    return this.prisma.user.update({
      where : {
        id
      },
      data
    })
  }
}
