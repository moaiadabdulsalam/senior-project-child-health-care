import { Module } from '@nestjs/common';
import { CHAT_TOKENS } from './constant/chat.tokens';

import { ConversationRequestController } from './controllers/conversation-request.controller';
import { ConversationController } from './controllers/conversation.controller';
import { MessageController } from './controllers/message.controller';

import { ConversationRequestService } from './services/conversation-request.service';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { MessageAttachmentService } from './services/message-attachment.service';
import { ConversationReadStateService } from './services/conversation-read-state.service';

import { ConversationRequestRepository } from './repositories/conversation-request.repository';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { MessageAttachmentRepository } from './repositories/message-attachment.repository';
import { ConversationReadStateRepository } from './repositories/conversation-read-state.repository';

import { ConversationAccessValidator } from './validators/conversation-access.validator';
import { SupabaseChatStorageProvider } from './providers/supabase-chat-storage.provider';
import { ChatGateway } from './gateway/chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports : [AuthModule],
  controllers: [
    ConversationRequestController,
    ConversationController,
    MessageController,
  ],
  providers: [
    ConversationRequestService,
    ConversationService,
    MessageService,
    MessageAttachmentService,
    ConversationReadStateService,

    ConversationAccessValidator,
    ChatGateway,

    {
      provide: CHAT_TOKENS.CONVERSATION_REQUEST_REPOSITORY,
      useClass: ConversationRequestRepository,
    },
    {
      provide: CHAT_TOKENS.CONVERSATION_REPOSITORY,
      useClass: ConversationRepository,
    },
    {
      provide: CHAT_TOKENS.MESSAGE_REPOSITORY,
      useClass: MessageRepository,
    },
    {
      provide: CHAT_TOKENS.MESSAGE_ATTACHMENT_REPOSITORY,
      useClass: MessageAttachmentRepository,
    },
    {
      provide: CHAT_TOKENS.CONVERSATION_READ_STATE_REPOSITORY,
      useClass: ConversationReadStateRepository,
    },
    {
      provide: CHAT_TOKENS.FILE_STORAGE,
      useClass: SupabaseChatStorageProvider,
    },
  ],
  exports: [
    ConversationRequestService,
    ConversationService,
    MessageService,
    MessageAttachmentService,
    ConversationReadStateService,
  ],
})
export class ChatModule {}