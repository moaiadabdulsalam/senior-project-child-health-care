import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { AppointmentStatus, Role, SlotFilterType } from '@prisma/client';
import { Roles } from 'src/core/decorator/role.decorator';
import { RoleGuard } from 'src/core/guard/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { CancelAppointmentDto } from '../dtos/cancelAppointment.dto';
import { CreateAppointmentDto } from '../dtos/createAppointment.dto';
import { UpdateAppointmentDto } from '../dtos/updateAppointment.dto';
import { AppointmentService } from '../services/appointment.service';
import { ParseDatePipe } from 'src/core/pipe/parse-date.pipe';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Controller()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  @SkipThrottle()
  @Roles(Role.PARENT)
  @Get('parent/appointment')
  getAllAppointmentForParent(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: AppointmentStatus,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { userId } = req.user;
    return this.appointmentService.getAppointmentsForParent(
      userId,
      page,
      limit,
      status,
      search,
      dateFrom,
      dateTo,
    );
  }

  @SkipThrottle()
  @Roles(Role.DOCTOR)
  @Get('doctor/appointment')
  getAllAppointmentForDoctor(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const { userId } = req.user;
    return this.appointmentService.getAppointmentsForDoctor(
      userId,
      page,
      limit,
      search,
      dateFrom,
      dateTo,
    );
  }

  @SkipThrottle()
  @Roles(Role.PARENT, Role.DOCTOR)
  @Get('appointment/:id')
  getOneAppointment(@Param('id') id: string) {
    return this.appointmentService.getOne(id);
  }

  @Roles(Role.PARENT)
  @Post('parent/appointment')
  createAppointment(@Body() dto: CreateAppointmentDto, @Req() req) {
    const { userId } = req.user;
    return this.appointmentService.createAppointment(userId, dto);
  }

  @Roles(Role.PARENT)
  @Patch('parent/appointment/:id')
  udpateAppointment(@Body() dto: UpdateAppointmentDto, @Req() req, @Param('id') id: string) {
    const { userId } = req.user;
    return this.appointmentService.updateAppointment(userId, id, dto);
  }

  @Roles(Role.PARENT)
  @Delete('parent/appointment/:id')
  deleteAppointment(@Param('id') id: string) {
    return this.appointmentService.deleteAppointment(id);
  }

  @Roles(Role.DOCTOR)
  @Post('doctor/appointment/:id')
  cancelAppointment(@Body() dto: CancelAppointmentDto, @Param('id') id: string) {
    return this.appointmentService.cancelAppointment(id, dto);
  }

  @Roles(Role.DOCTOR)
  @Get('calender/slot')
  getSlotPerDay(
    @Req() req,
    @Query('date', new DefaultValuePipe(new Date()), ParseDatePipe) date?: Date,
    @Query('type') type? : SlotFilterType
  ) {
    const { userId } = req.user;
    return this.appointmentService.getSlotPerDay(userId, date, type);
  }

  @Roles(Role.DOCTOR)
  @Get('calender/slots')
  getSlotPerMonth(
    @Req() req,
    @Query('date', new DefaultValuePipe(new Date()), ParseDatePipe) date?: Date,
    @Query('type') type? : SlotFilterType
  ) {
    const { userId } = req.user;
    return this.appointmentService.getSlotPerMonth(userId, date,type);
  }
}
