import { Injectable } from '@nestjs/common';
import { ConversationStatus } from '@prisma/client';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { parentId: string; doctorId: string }) {
    return this.prisma.conversation.create({ data });
  }

  findById(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  findByParticipants(parentId: string, doctorId: string) {
    return this.prisma.conversation.findUnique({
      where: {
        parentId_doctorId: {
          parentId,
          doctorId,
        },
      },
    });
  }

  findMyConversations(userId: string, status: ConversationStatus) {
    return this.prisma.conversation.findMany({
      where: {
        status,
        OR: [{ parentId: userId }, { doctorId: userId }],
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
      include: {
        parent: {
          include: {
            profileParent: true,
          },
        },
        doctor: {
          include: {
            profileDoctory: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            attachments: true,
          },
        },
      },
    });
  }

  updateStatus(id: string, status: ConversationStatus) {
    return this.prisma.conversation.update({
      where: { id },
      data: { status },
    });
  }

  async updateLastMessageAt(id: string, date: Date): Promise<void> {
    await this.prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: date },
    });
  }
}
