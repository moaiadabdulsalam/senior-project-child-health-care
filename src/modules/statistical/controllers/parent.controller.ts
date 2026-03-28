import { Controller, DefaultValuePipe, Get, ParseDatePipe, Query, Req } from '@nestjs/common';
import { ParentStatisticalService } from '../services/parentStatistical.service';

@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentStatisticalService) {}

  @Get('/photo')
  getPhotoWithAge(@Req() req) {
    const { userId } = req.user;
    return this.parentService.getPhotoWithAge(userId);
  }

  @Get('/totalGames')
  totalGames(@Req() req, @Query('date', new ParseDatePipe()) date?: Date) {
    const { userId } = req.user;
    return this.parentService.totalGames(userId, date);
  }

  @Get('/totalGames')
  totalAppointments(@Req() req) {
    const { userId } = req.user;
    return this.parentService.totalAppointments(userId);
  }

  @Get('/medication')
  getMedication(@Req() req) {
    const { userId } = req.user;
    return this.parentService.getMedication(userId);
  }
}

/*
child photo if exit + age of child , a medicine ,   an appointment if exist ,  
*/
