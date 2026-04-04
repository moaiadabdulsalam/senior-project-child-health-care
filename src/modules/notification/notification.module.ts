import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationReaderService } from './services/notification-reader.service';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationGateway } from './gateways/notification.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [
    NotificationService,
    NotificationReaderService,
    NotificationRepository,
    NotificationGateway,
  ],
  controllers: [NotificationController],
  exports: [NotificationService, NotificationReaderService, NotificationGateway],
})
export class NotificationModule {}
