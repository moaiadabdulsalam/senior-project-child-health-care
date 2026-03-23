import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { request } from 'express';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.DOCTOR)
@Controller('statistical')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}
  @Get('revenue')
  revenue(@Req() req, @Query('from') from?: string, @Query('to') to?: string) {
    const { userId } = req.user;
    return this.doctorService.revenue(userId, from, to);
  }
  @Get('/todayAppointments')
  todayAppointments(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.todayAppointments(userId);
  }

  @Get('/averagePatientAge')
  averagePatientAge() {}

  @Get('/genderDistribution')
  genderDistribution(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.genderDistribution(userId);
  }

  @Get('/bookingLastMonth')
  bookingLastMonth(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.bookingLastMonth(userId);
  }

  @Get('/totalPatient')
  getTotalPatient(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.totalPatient(userId);
  }

  @Get('/totalParent')
  getTotalParent(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.totalParent(userId);
  }
}

/*
revenue
todayAppointments
genderDistribution
bookingLastMonth
totalPatient
totalParent
*/
