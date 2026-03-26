import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/overview/total')
  total() {
    return this.adminService.total();
  }

  @Get('/doctorsProfile')
  doctorsProfile() {
    return this.adminService.doctorsProfile();
  }

  @Get('/doctor-speciality')
  speciality() {
    return this.adminService.doctorSpeciality();
  }
  @Get('/child-distribution')
  genderDistribution() {
    return this.adminService.genderDistribution();
  }
}
/*
total doctor , total parent , total child , total active user ,
doctor profile , 
speciality , 
genderDistribution ,
*/
