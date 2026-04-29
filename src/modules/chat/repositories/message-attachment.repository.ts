import { Injectable } from '@nestjs/common';
import { AttachmentType } from '@prisma/client';
import { IMessageAttachmentRepository } from '../interfaces/message-attachment-repository.interface';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class MessageAttachmentRepository implements IMessageAttachmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    messageId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    storageKey: string;
    url: string;
    attachmentType: AttachmentType;
  }) {
    return this.prisma.messageAttachment.create({
      data,
    });
  }
}
