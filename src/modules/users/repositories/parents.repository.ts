import { Injectable } from '@nestjs/common';
import { Child, Prisma, ProfileDoctor, ProfileParent } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ParentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUserParent() {
    return await this.prisma.user.findMany({
      select,
    });
  }

  async getChildsForSpecficParent(parentId: string) {
    return await this.prisma.child.findMany({
      where: {
        parentId,
      },
      select,
    });
  }

  async getParent(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select,
    });
  }

  async updateAccountParentAndChildsActivity(id: string, isActive: boolean, ids: string[]) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          isActive,
        },
      });
      await tx.child.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          isActive,
        },
      });
    });
  }
}

const select = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profileParent: {
    select: {
      id: true,
      fullName: true,
      fullNameArabic: true,
      address: true,
      addressArabic: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.UserSelect;
//4/13/2026
