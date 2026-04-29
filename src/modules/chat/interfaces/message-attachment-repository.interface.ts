import { AttachmentType, MessageAttachment } from '@prisma/client';

export interface IMessageAttachmentRepository {
  create(data: {
    messageId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
    url: string;
    attachmentType: AttachmentType;
  }): Promise<MessageAttachment>;
}