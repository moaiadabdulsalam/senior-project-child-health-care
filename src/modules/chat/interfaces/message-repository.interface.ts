import { Message, Prisma } from '@prisma/client';

export interface IMessageRepository {
  create(data: Prisma.MessageUncheckedCreateInput): Promise<Message>;

  findByConversationId(conversationId: string, skip: number, take: number): Promise<Message[]>;

  findLastMessage(conversationId: string): Promise<Message | null>;
}
