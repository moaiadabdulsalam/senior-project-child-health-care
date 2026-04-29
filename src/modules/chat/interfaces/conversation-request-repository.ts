import { ConversationRequest, ConversationRequestStatus } from '@prisma/client';

export interface IConversationRequestRepository {
  create(data: {
    parentId: string;
    doctorId: string;
    initialMessage: string;
  }): Promise<ConversationRequest>;

  findById(id: string): Promise<ConversationRequest | null>;

  findPending(parentId: string, doctorId: string): Promise<ConversationRequest | null>;

  updateStatus(
    id: string,
    data: {
      status: ConversationRequestStatus;
      respondedAt?: Date;
      rejectedReason?: string;
      conversationId?: string;
    },
  ): Promise<ConversationRequest>;


  findByDoctorId(doctorId: string): Promise<ConversationRequest[]>;
}