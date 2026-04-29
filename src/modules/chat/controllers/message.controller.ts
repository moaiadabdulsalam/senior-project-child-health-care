import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MessageService } from '../services/message.service';
import { MessageAttachmentService } from '../services/message-attachment.service';
import { ConversationReadStateService } from '../services/conversation-read-state.service';
import { SendTextMessageDto } from '../dto/send-text-message.dto';
import { GetMessagesQueryDto } from '../dto/get-messages-query.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/core/guard/role.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.DOCTOR, Role.PARENT)
@Controller('chat/messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly attachmentService: MessageAttachmentService,
    private readonly readStateService: ConversationReadStateService,
  ) {}

  @Post('text')
  sendText(@Req() req, @Body() dto: SendTextMessageDto) {
    return this.messageService.sendTextMessage(req.user.userId, dto.conversationId, dto.text);
  }

  @Post(':conversationId/file')
  @UseInterceptors(FileInterceptor('file'))
  sendFile(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('text') text?: string,
    @Body('isReport') isReport?: string,
  ) {
    const isReportBoolean = isReport === 'true';

    return this.attachmentService.sendFileMessage(
      req.user.userId,
      conversationId,
      file,
      text,
      isReportBoolean,
    );
  }

  @Get(':conversationId')
  getMessages(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.messageService.getMessages(
      req.user.userId,
      conversationId,
      Number(query.page ?? 1),
      Number(query.limit ?? 30),
    );
  }

  @Post(':conversationId/read')
  markAsRead(@Req() req, @Param('conversationId') conversationId: string) {
    return this.readStateService.markConversationAsRead(req.user.userId, conversationId);
  }
}
