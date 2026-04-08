import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AvailabilityPolicyService } from '../services/availability-policy.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { CreatePolicyDto } from '../dtos/createPolicy.dto';
import { UpdatePolicyDto } from '../dtos/updatePolicy.dto';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.DOCTOR)
@Controller('availability-policy')
export class AvailabilityPolicyController {
  constructor(private readonly availiablityPolicyService: AvailabilityPolicyService) {}

  @SkipThrottle()
  @Get()
  getPolicy(@Req() req) {
    const { userId } = req.user;
    return this.availiablityPolicyService.getPolicy(userId);
  }

  @Post()
  createPolicy(@Body() dto: CreatePolicyDto, @Req() req) {
    const { userId } = req.user;
    return this.availiablityPolicyService.createPolicy(dto, userId);
  }

  @Patch()
  updatePolicy(@Req() req, @Body() dto: UpdatePolicyDto) {
    const { userId } = req.user;
    return this.availiablityPolicyService.updatePolicy(dto, userId);
  }


   
}
