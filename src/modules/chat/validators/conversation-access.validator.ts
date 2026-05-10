import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Conversation, ConversationStatus } from '@prisma/client';

@Injectable()
export class ConversationAccessValidator {
  validateExists(conversation: Conversation | null): Conversation {
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  validateUserIsParticipant(conversation: Conversation, userId: string): void {
    const isParticipant = conversation.parentId === userId || conversation.doctorId === userId;

    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this conversation');
    }
  }

  validateCanSendMessage(conversation: Conversation): void {
    if (conversation.status !== ConversationStatus.OPEN) {
      throw new ForbiddenException('Conversation is not open');
    }
  }
}
