import { Conversation, ConversationStatus } from '@prisma/client';

export interface IConversationRepository {

  create(data: {
    parentId: string;
    doctorId: string;
  }): Promise<Conversation>;

  findById(id: string): Promise<Conversation | null>;

  findByParticipants(
    parentId: string,
    doctorId: string,
  ): Promise<Conversation | null>;

  findMyConversations(userId: string, status: ConversationStatus): Promise<Conversation[]>;

  updateStatus(id: string, status: ConversationStatus): Promise<Conversation>;

  updateLastMessageAt(id: string, date: Date): Promise<void>;
  
}