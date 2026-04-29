import { Injectable } from '@nestjs/common';
import { MessageType, Prisma } from '@prisma/client';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class MessageRepository implements IMessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MessageUncheckedCreateInput) {
    return this.prisma.message.create({ data });
  }

  findByConversationId(conversationId: string, skip: number, take: number) {
    return this.prisma.message.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
      include: {
        attachments: true,
        sender: {
          include: {
            profileParent: true,
            profileDoctory: true,
          },
        },
      },
    });
  }

  findLastMessage(conversationId: string) {
    return this.prisma.message.findFirst({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
