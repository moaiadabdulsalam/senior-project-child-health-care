import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ConversationRequestService } from '../services/conversation-request.service';
import { CreateConversationRequestDto } from '../dto/create-conversation-request.dto';
import { RejectConversationRequestDto } from '../dto/reject-conversation-request.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard , RoleGuard)

@Controller('chat/requests')
export class ConversationRequestController {
  constructor(
    private readonly conversationRequestService: ConversationRequestService,
  ) {}

  @Roles(Role.DOCTOR)
  @Get()
  getDoctorRequests(@Req() req) {
    return this.conversationRequestService.getDoctorRequests(
      req.user.userId,
    );
  }
  @Roles(Role.PARENT)
  @Post()
  create(@Req() req, @Body() dto: CreateConversationRequestDto) {
    return this.conversationRequestService.create(
      req.user.userId,
      dto.doctorId,
      dto.initialMessage,
    );
  }

  @Roles(Role.DOCTOR)
  @Post(':id/approve')
  approve(@Req() req, @Param('id') id: string) {
    return this.conversationRequestService.approve(id, req.user.userId);
  }

  @Roles(Role.DOCTOR)
  @Post(':id/reject')
  reject(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: RejectConversationRequestDto,
  ) {
    return this.conversationRequestService.reject(
      id,
      req.user.userId,
      dto.rejectedReason,
    );
  }
}