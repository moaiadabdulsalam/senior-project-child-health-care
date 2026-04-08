import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DoctorStatisticalService } from '../services/doctorStatistical.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { AdminService } from '../services/admin.service';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.DOCTOR)
@Controller('statistical')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorStatisticalService,
    private readonly adminService: AdminService,
  ) {}
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
