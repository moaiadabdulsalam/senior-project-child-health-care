import { Injectable } from '@nestjs/common';
import { Child, Prisma, ProfileDoctor, ProfileParent } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ParentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUserParent() {
    return await this.prisma.user.findMany({
      include: {
        profileParent: true,
      },
    });
  }

  async getChildsForSpecficParent(parentId: string) {
    return await this.prisma.child.findMany({
      where: {
        parentId,
      },
      include: {
        profileParent: true,
      },
    });
  }

  async getParent(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      include: { profileParent: true },
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
