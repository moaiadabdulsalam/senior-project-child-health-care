import { Injectable } from '@nestjs/common';
import { Prisma, Notification } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationUncheckedCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
    });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findMany(params: {
    where?: Prisma.NotificationWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.NotificationOrderByWithRelationInput;
  }): Promise<Notification[]> {
    const { where, skip, take, orderBy } = params;

    return this.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy,
    });
  }

  async count(where?: Prisma.NotificationWhereInput): Promise<number> {
    return this.prisma.notification.count({
      where,
    });
  }

  async update(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async updateMany(
    where: Prisma.NotificationWhereInput,
    data: Prisma.NotificationUpdateManyMutationInput,
  ) {
    return this.prisma.notification.updateMany({
      where,
      data,
    });
  }
}