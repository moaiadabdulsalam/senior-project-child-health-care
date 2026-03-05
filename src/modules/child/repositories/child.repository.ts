import { Injectable } from '@nestjs/common';
import { Child, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ChildRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createChild(data: Prisma.ChildCreateInput): Promise<Child> {
    return this.prisma.child.create({
      data,
    });
  }

  async findById(id: string): Promise<Child | null> {
    return this.prisma.child.findFirst({
      where: {
        id,
      },
    });
  }

  async updateChild(id: string, data: Prisma.ChildUpdateInput): Promise<Child> {
    return this.prisma.child.update({
      where: { id },
      data,
    });
  }
  async deleteChild(id: string): Promise<Child> {
    return this.prisma.child.delete({
      where: { id },
    });
  }

  async existChild(id: string): Promise<boolean> {
    const child = await this.prisma.child.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!child;
  }
}
