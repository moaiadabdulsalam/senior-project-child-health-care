import { Inject, Injectable } from '@nestjs/common';
import { MessageType } from '@prisma/client';
import { CHAT_TOKENS } from '../constant/chat.tokens';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { ConversationAccessValidator } from '../validators/conversation-access.validator';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class MessageService {
  constructor(
    @Inject(CHAT_TOKENS.CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    @Inject(CHAT_TOKENS.MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,

    private readonly accessValidator: ConversationAccessValidator,
    private readonly chatGateway: ChatGateway,
  ) {}

  async sendTextMessage(userId: string, conversationId: string, text: string) {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);
    this.accessValidator.validateCanSendMessage(validConversation);

    const message = await this.messageRepository.create({
      conversationId,
      senderId: userId,
      type: MessageType.TEXT,
      text,
    });

    await this.conversationRepository.updateLastMessageAt(
      conversationId,
      message.createdAt,
    );

    this.chatGateway.emitNewMessage(conversationId, message);

    return message;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    page = 1,
    limit = 30,
  ) {
    const conversation =
      await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);

    const skip = (page - 1) * limit;

    return this.messageRepository.findByConversationId(
      conversationId,
      skip,
      limit,
    );
  }
}