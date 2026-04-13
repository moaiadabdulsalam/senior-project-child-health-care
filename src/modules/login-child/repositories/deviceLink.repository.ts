import { Injectable } from '@nestjs/common';
import { DeviceLinkStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class DeviceLinkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLink(data: Prisma.DeviceLinkRequestUncheckedCreateInput) {
    return this.prisma.deviceLinkRequest.create({ data });
  }

  async findPendingDevices() {
    return this.prisma.deviceLinkRequest.findMany({
      where: {
        status : DeviceLinkStatus.PENDING,
       

      },
      orderBy : {
        createdAt : 'desc'
      }
    });
  }

  async update(id: string, data: Prisma.DeviceLinkRequestUpdateInput) {
    return this.prisma.deviceLinkRequest.update({
      where: { id },
      data,
    });
  }

  async updateMany(
    where: Prisma.DeviceLinkRequestWhereInput,
    data: Prisma.DeviceLinkRequestUpdateInput,
  ) {
    return this.prisma.deviceLinkRequest.updateMany({
      where,
      data,
    });
  }
}
