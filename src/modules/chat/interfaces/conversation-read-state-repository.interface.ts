import { ConversationReadState } from '@prisma/client';

export interface IConversationReadStateRepository {
  upsert(data: {
    conversationId: string;
    userId: string;
    lastReadMessageId: string;
    lastReadAt: Date;
  }): Promise<ConversationReadState>;
}
