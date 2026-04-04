import { Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';

import { NotificationReaderService } from '../services/notification-reader.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { NotificationQueryDto } from '../dtos/notification-query.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    
  constructor(private readonly notificationReaderService: NotificationReaderService) {}

  @Get('me')
  async getMyNotifications(@Req() req, @Query() query: NotificationQueryDto) {
    return this.notificationReaderService.getMyNotifications(req.user.userId, query);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req) {
    return this.notificationReaderService.getUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req) {
    return this.notificationReaderService.markAsRead(id, req.user.userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req) {
    return this.notificationReaderService.markAllAsRead(req.user.userId);
  }
}
