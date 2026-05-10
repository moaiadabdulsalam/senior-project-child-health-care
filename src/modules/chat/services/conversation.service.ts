import { Inject, Injectable } from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { CHAT_TOKENS } from '../constant/chat.tokens';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { ConversationAccessValidator } from '../validators/conversation-access.validator';

@Injectable()
export class ConversationService {
  constructor(
    @Inject(CHAT_TOKENS.CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    private readonly accessValidator: ConversationAccessValidator,
  ) {}

  getMyConversations(userId: string, status: ConversationStatus) {
    return this.conversationRepository.findMyConversations(userId, status);
  }

  async close(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);

    return this.conversationRepository.updateStatus(conversationId, ConversationStatus.CLOSED);
  }

  async archive(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);

    return this.conversationRepository.updateStatus(conversationId, ConversationStatus.ARCHIVED);
  }

  async block(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);

    return this.conversationRepository.updateStatus(conversationId, ConversationStatus.BLOCKED);
  }
}
