import {
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { NotificationRepository } from '../repositories/notification.repository';
  import { NotificationQueryDto } from '../dtos/notification-query.dto';
  import { NotificationGateway } from '../gateways/notification.gateway';
  
  @Injectable()
  export class NotificationReaderService {
    constructor(
      private readonly notificationRepository: NotificationRepository,
      private readonly notificationGateway: NotificationGateway,
    ) {}
  
    async getMyNotifications(userId: string, query: NotificationQueryDto) {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1) * limit;
  
      const where: any = { userId };
  
      if (query.isRead !== undefined) {
        where.isRead = query.isRead === 'true';
      }
  
      const [notifications, total, unreadCount] = await Promise.all([
        this.notificationRepository.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.notificationRepository.count(where),
        this.notificationRepository.count({
          userId,
          isRead: false,
        }),
      ]);
  
      return {
        data: notifications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          unreadCount,
        },
      };
    }
  
    async markAsRead(notificationId: string, userId: string) {
      const notification = await this.notificationRepository.findById(notificationId);
      
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
  
      if (notification.userId !== userId) {
        throw new ForbiddenException('You cannot access this notification');
      }
  
      let updated = notification;
  
      if (!notification.isRead) {
        updated = await this.notificationRepository.update(notificationId, {
          isRead: true,
          readAt: new Date(),
        });
      }
  
      const unreadCount = await this.notificationRepository.count({
        userId,
        isRead: false,
      });
  
      this.notificationGateway.emitUnreadCount(userId, unreadCount);
  
      return updated;
    }
  
    async markAllAsRead(userId: string) {
      const result = await this.notificationRepository.updateMany(
        {
          userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
      );
  
      this.notificationGateway.emitUnreadCount(userId, 0);
  
      return result;
    }
  
    async getUnreadCount(userId: string) {
      const unreadCount = await this.notificationRepository.count({
        userId,
        isRead: false,
      });
  
      return { unreadCount };
    }
  }