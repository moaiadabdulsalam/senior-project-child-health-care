import { Injectable } from '@nestjs/common';
import { Notification, Prisma, Role } from '@prisma/client';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationGateway } from '../gateways/notification.gateway';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly notificationGateway: NotificationGateway,
    private readonly userRepo: AuthRepository,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.notificationRepository.create({
      userId: dto.userId,
      senderId: dto.senderId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      data: dto.data,
    });

    const unreadCount = await this.notificationRepository.count({
      userId: dto.userId,
      isRead: false,
    });

    this.notificationGateway.emitToUser(dto.userId, notification);
    this.notificationGateway.emitUnreadCount(dto.userId, unreadCount);

    return notification;
  }

  async createManyForUsers(
    userIds: string[],
    payload: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<void> {
    for (const userId of userIds) {
      await this.create({
        userId,
        senderId: payload.senderId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        data: payload.data,
      });
    }
  }

  async createForRole(role: Role, dto: Omit<CreateNotificationDto, 'userId'>) {
    const where: Prisma.UserWhereInput = { role };
    const userIds = await this.userRepo.findAllUsers(where);

    for (const users of userIds) {
      await this.create({
        userId: users.id,
        senderId: dto.senderId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        data: dto.data,
      });
    }
  }
}
