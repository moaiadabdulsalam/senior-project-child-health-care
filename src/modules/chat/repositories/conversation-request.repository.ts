import { Injectable } from '@nestjs/common';
import { ConversationRequestStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { IConversationRequestRepository } from '../interfaces/conversation-request-repository';

@Injectable()
export class ConversationRequestRepository implements IConversationRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { parentId: string; doctorId: string; initialMessage: string }) {
    return this.prisma.conversationRequest.create({ data });
  }

  findById(id: string) {
    return this.prisma.conversationRequest.findUnique({
      where: { id },
    });
  }

  findByDoctorId(doctorId) {
    return this.prisma.conversationRequest.findMany({
      where: {
        doctorId,
        status: ConversationRequestStatus.PENDING,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        parent: {
          include: {
            profileParent: true,
          },
        },
      },
    });
  }
  findPending(parentId: string, doctorId: string) {
    return this.prisma.conversationRequest.findFirst({
      where: {
        parentId,
        doctorId,
        status: ConversationRequestStatus.PENDING,
      },
    });
  }

  updateStatus(
    id: string,
    data: {
      status: ConversationRequestStatus;
      respondedAt?: Date;
      rejectedReason?: string;
      conversationId?: string;
    },
  ) {
    return this.prisma.conversationRequest.update({
      where: { id },
      data,
    });
  }
}
