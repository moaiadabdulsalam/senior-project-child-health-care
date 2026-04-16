import { Controller, DefaultValuePipe, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DoctorStatisticalService } from '../services/doctorStatistical.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role, TypeOfRevenue } from '@prisma/client';
import { AdminService } from '../services/admin.service';
import { ParseDatePipe } from 'src/core/pipe/parse-date.pipe';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.DOCTOR)
@Controller('statistical')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorStatisticalService,
    private readonly adminService: AdminService,
  ) {}
  @Get('revenue')
  revenue(
    @Req() req,
    @Query('date') date?: Date,
    @Query('type') type?: TypeOfRevenue,
  ) {
    const { userId } = req.user;
    return this.doctorService.revenues(userId, date, type);
  }
  @Get('/todayAppointments')
  todayAppointments(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.todayAppointments(userId);
  }

  @Get('/averagePatientAge')
  averagePatientAge(@Req() req) {
    const { userId } = req.user;
    return this.doctorService.averagePatientAge(userId);
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
  @Get('/genderDistribution')
  genderDistribution() {
    return this.adminService.genderDistribution();
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
