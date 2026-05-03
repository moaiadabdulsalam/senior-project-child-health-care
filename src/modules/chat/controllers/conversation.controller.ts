import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from '../services/conversation.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { ConversationStatus, Role } from '@prisma/client';
import { Roles } from 'src/core/decorator/role.decorator';
import { RoleGuard } from 'src/core/guard/role.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.PARENT, Role.DOCTOR)
@Controller('chat/conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  getMyConversations(
    @Req() req,
    @Query('status', new DefaultValuePipe(ConversationStatus.OPEN)) status: ConversationStatus,
  ) {
    return this.conversationService.getMyConversations(req.user.userId, status);
  }

  @Patch(':id/close')
  close(@Req() req, @Param('id') id: string) {
    return this.conversationService.close(id, req.user.userId);
  }

  @Patch(':id/archive')
  archive(@Req() req, @Param('id') id: string) {
    return this.conversationService.archive(id, req.user.userId);
  }

  @Patch(':id/block')
  block(@Req() req, @Param('id') id: string) {
    return this.conversationService.block(id, req.user.userId);
  }
}
