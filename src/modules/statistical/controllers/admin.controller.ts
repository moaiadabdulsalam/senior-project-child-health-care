import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';



@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/overview/total')
  total() {
    return this.adminService.total();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/doctorsProfile')
  doctorsProfile() {
    return this.adminService.doctorsProfile();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/doctor-speciality')
  speciality() {
    return this.adminService.doctorSpeciality();
  }
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Get('/child-distribution')
  genderDistribution() {
    return this.adminService.genderDistribution();
  }

  @Get('/test')
  test(){
    return "hello from rawilay"
  }
}
/*
total doctor , total parent , total child , total active user ,
doctor profile , 
speciality , 
genderDistribution ,
*/
