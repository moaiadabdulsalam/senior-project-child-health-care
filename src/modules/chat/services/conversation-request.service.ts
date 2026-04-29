import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationRequestStatus, MessageType } from '@prisma/client';
import { CHAT_TOKENS } from '../constant/chat.tokens';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { IConversationRequestRepository } from '../interfaces/conversation-request-repository';

@Injectable()
export class ConversationRequestService {
  constructor(
    @Inject(CHAT_TOKENS.CONVERSATION_REQUEST_REPOSITORY)
    private readonly requestRepository: IConversationRequestRepository,

    @Inject(CHAT_TOKENS.CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    @Inject(CHAT_TOKENS.MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async getDoctorRequests(doctorId: string) {
    return this.requestRepository.findByDoctorId(doctorId);
  }
  async create(parentId: string, doctorId: string, initialMessage: string) {
    const existingConversation = await this.conversationRepository.findByParticipants(
      parentId,
      doctorId,
    );

    if (existingConversation) {
      throw new BadRequestException('Conversation already exists');
    }

    const pending = await this.requestRepository.findPending(parentId, doctorId);

    if (pending) {
      throw new BadRequestException('You already have pending request');
    }

    return this.requestRepository.create({
      parentId,
      doctorId,
      initialMessage,
    });
  }

  async approve(requestId: string, doctorId: string) {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Conversation request not found');
    }

    if (request.doctorId !== doctorId) {
      throw new ForbiddenException('You cannot approve this request');
    }

    if (request.status !== ConversationRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    const conversation = await this.conversationRepository.create({
      parentId: request.parentId,
      doctorId: request.doctorId,
    });

    const firstMessage = await this.messageRepository.create({
      conversationId: conversation.id,
      senderId: request.parentId,
      type: MessageType.TEXT,
      text: request.initialMessage,
    });

    await this.conversationRepository.updateLastMessageAt(conversation.id, firstMessage.createdAt);

    return this.requestRepository.updateStatus(request.id, {
      status: ConversationRequestStatus.APPROVED,
      respondedAt: new Date(),
      conversationId: conversation.id,
    });
  }

  async reject(requestId: string, doctorId: string, rejectedReason?: string) {
    const request = await this.requestRepository.findById(requestId);

    if (!request) {
      throw new NotFoundException('Conversation request not found');
    }

    if (request.doctorId !== doctorId) {
      throw new ForbiddenException('You cannot reject this request');
    }

    if (request.status !== ConversationRequestStatus.PENDING) {
      throw new BadRequestException('Request is not pending');
    }

    return this.requestRepository.updateStatus(request.id, {
      status: ConversationRequestStatus.REJECTED,
      respondedAt: new Date(),
      rejectedReason,
    });
  }
}
