import { Injectable } from '@nestjs/common';
import { AccessSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class LoginChildRepository {
  constructor(private readonly prisma: PrismaService) {}

  async CreateChildAccessSession(data: Prisma.ChildAccessSessionUncheckedCreateInput) {
    return this.prisma.childAccessSession.create({ data });
  }

  async updateManyToExpire(
    data: Prisma.ChildAccessSessionUpdateInput,
    where: Prisma.ChildAccessSessionWhereInput,
  ) {
    return this.prisma.childAccessSession.updateMany({ where, data });
  }

  async getSessionById(where: Prisma.ChildAccessSessionWhereInput) {
    return await this.prisma.childAccessSession.findFirst({
      where,
    });
  }

  async updateOne(id: string, data: Prisma.ChildAccessSessionUpdateInput) {
    return this.prisma.childAccessSession.update({
      where: { id },
      data,
    });
  }

  async getAllAccessSession(
    where: Prisma.ChildAccessSessionWhereInput,
    skip?: number,
    limit?: number,
  ) {
    return this.prisma.childAccessSession.findMany({
      where,
      skip,
      take: limit,
    });
  }

  async count(where: Prisma.ChildAccessSessionWhereInput) {
    return this.prisma.childAccessSession.count({
      where,
    });
  }
}
