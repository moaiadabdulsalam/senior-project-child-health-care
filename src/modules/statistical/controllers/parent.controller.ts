import { Controller, DefaultValuePipe, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ParentStatisticalService } from '../services/parentStatistical.service';
import { ParseDatePipe } from 'src/core/pipe/parse-date.pipe';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.PARENT)
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentStatisticalService) {}

  @SkipThrottle()
  @Get('/photo')
  getPhotoWithAge(@Req() req) {
    const { userId } = req.user;
    return this.parentService.getPhotoWithAge(userId);
  }

  @SkipThrottle()
  @Get('/totalGames')
  totalGames(
    @Req() req,
    @Query('date', new DefaultValuePipe(new Date()), ParseDatePipe) date?: Date,
  ) {
    const { userId } = req.user;
    return this.parentService.totalGames(userId, date);
  }

  @SkipThrottle()
  @Get('/totalAppointments')
  totalAppointments(@Req() req) {
    const { userId } = req.user;
    return this.parentService.totalAppointments(userId);
  }

  @SkipThrottle()
  @Get('/medication')
  getMedication(@Req() req) {
    const { userId } = req.user;
    return this.parentService.getMedication(userId);
  }
}
