import { Injectable } from '@nestjs/common';
import { IConversationReadStateRepository } from '../interfaces/conversation-read-state-repository.interface';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ConversationReadStateRepository implements IConversationReadStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(data: {
    conversationId: string;
    userId: string;
    lastReadMessageId: string;
    lastReadAt: Date;
  }) {
    return this.prisma.conversationReadState.upsert({
      where: {
        conversationId_userId: {
          conversationId: data.conversationId,
          userId: data.userId,
        },
      },
      update: {
        lastReadMessageId: data.lastReadMessageId,
        lastReadAt: data.lastReadAt,
      },
      create: data,
    });
  }
}
