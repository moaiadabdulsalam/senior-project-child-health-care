import { Inject, Injectable } from '@nestjs/common';
import { CHAT_TOKENS } from '../constant/chat.tokens';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { IConversationReadStateRepository } from '../interfaces/conversation-read-state-repository.interface';
import { ConversationAccessValidator } from '../validators/conversation-access.validator';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class ConversationReadStateService {
  constructor(
    @Inject(CHAT_TOKENS.CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    @Inject(CHAT_TOKENS.MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,

    @Inject(CHAT_TOKENS.CONVERSATION_READ_STATE_REPOSITORY)
    private readonly readStateRepository: IConversationReadStateRepository,

    private readonly accessValidator: ConversationAccessValidator,
    private readonly chatGateway: ChatGateway,
  ) {}

  async markConversationAsRead(userId: string, conversationId: string) {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);

    const lastMessage =
      await this.messageRepository.findLastMessage(conversationId);

    if (!lastMessage) {
      return { success: true };
    }

    const readState = await this.readStateRepository.upsert({
      conversationId,
      userId,
      lastReadMessageId: lastMessage.id,
      lastReadAt: new Date(),
    });

    this.chatGateway.emitConversationRead(conversationId, {
      conversationId,
      userId,
      lastReadMessageId: lastMessage.id,
      lastReadAt: readState.lastReadAt,
    });

    return { success: true };
  }
}