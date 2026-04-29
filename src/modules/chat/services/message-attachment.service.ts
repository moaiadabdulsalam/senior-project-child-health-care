import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AttachmentType, MessageType } from '@prisma/client';
import { CHAT_TOKENS } from '../constant/chat.tokens';
import { IFileStorage } from '../interfaces/file-storage.interface';
import { IMessageRepository } from '../interfaces/message-repository.interface';
import { IMessageAttachmentRepository } from '../interfaces/message-attachment-repository.interface';
import { IConversationRepository } from '../interfaces/conversation-repository.interface';
import { ConversationAccessValidator } from '../validators/conversation-access.validator';
import { ChatGateway } from '../gateway/chat.gateway';

@Injectable()
export class MessageAttachmentService {
  constructor(
    @Inject(CHAT_TOKENS.FILE_STORAGE)
    private readonly fileStorage: IFileStorage,

    @Inject(CHAT_TOKENS.CONVERSATION_REPOSITORY)
    private readonly conversationRepository: IConversationRepository,

    @Inject(CHAT_TOKENS.MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,

    @Inject(CHAT_TOKENS.MESSAGE_ATTACHMENT_REPOSITORY)
    private readonly attachmentRepository: IMessageAttachmentRepository,

    private readonly accessValidator: ConversationAccessValidator,
    private readonly chatGateway: ChatGateway,
  ) {}

  async sendFileMessage(
    userId: string,
    conversationId: string,
    file: Express.Multer.File,
    text?: string,
    isReport = false,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const conversation =
      await this.conversationRepository.findById(conversationId);

    const validConversation = this.accessValidator.validateExists(conversation);
    this.accessValidator.validateUserIsParticipant(validConversation, userId);
    this.accessValidator.validateCanSendMessage(validConversation);

    const uploaded = await this.fileStorage.uploadChatFile(file);

    const messageType = this.resolveMessageType(file.mimetype, isReport);
    const attachmentType = this.resolveAttachmentType(file.mimetype, isReport);

    const message = await this.messageRepository.create({
      conversationId,
      senderId: userId,
      type: messageType,
      text: text ?? null,
    });

    const attachment = await this.attachmentRepository.create({
      messageId: message.id,
      fileName: uploaded.fileName,
      mimeType: uploaded.mimeType,
      fileSize: uploaded.fileSize,
      storageKey: uploaded.key,
      url: uploaded.url,
      attachmentType,
    });

    await this.conversationRepository.updateLastMessageAt(
      conversationId,
      message.createdAt,
    );

    const payload = {
      ...message,
      attachments: [attachment],
    };

    this.chatGateway.emitNewMessage(conversationId, payload);

    return payload;
  }

  private resolveMessageType(
    mimeType: string,
    isReport: boolean,
  ): MessageType {
    if (isReport) return MessageType.FILE;

    if (mimeType.startsWith('image/')) {
      return MessageType.IMAGE;
    }

    if (mimeType.startsWith('audio/')) {
      return MessageType.VOICE;
    }

    return MessageType.FILE;
  }

  private resolveAttachmentType(
    mimeType: string,
    isReport: boolean,
  ): AttachmentType {
    if (isReport) {
      return AttachmentType.REPORT;
    }

    if (mimeType.startsWith('image/')) {
      return AttachmentType.IMAGE;
    }

    if (mimeType.startsWith('audio/')) {
      return AttachmentType.VOICE;
    }

    if (mimeType === 'application/pdf') {
      return AttachmentType.PDF;
    }

    return AttachmentType.OTHER;
  }
}