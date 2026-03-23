import { Body, Controller, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UpdateDoctorProfileDto } from '../dtos/updateDoctorProfile.dto';
import { ProfileService } from '../services/profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UpdateParentProfileDto } from '../dtos/updateParentProfile.dto';
import { ChangePasswordDto } from '../dtos/changePass.dto';

@UseGuards(JwtAuthGuard , RoleGuard,ThrottlerGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}


  @Roles(Role.DOCTOR)
  @Patch('/doctor')
  updateDoctorProfile(@Req() req, dto: UpdateDoctorProfileDto) {
    const { userId } = req.user;
    return this.profileService.updateDoctorProfile(userId, dto);
  }

  @Patch('/parent')
  @Roles(Role.PARENT)
  updateParentProfile(@Req() req , @Body() dto : UpdateParentProfileDto){
    const {userId} = req.user
    return this.profileService.updateParentProfile(userId , dto)
  }

  @Roles(Role.PARENT,Role.DOCTOR)
  @Patch('change-password')
  changePassword(@Req() req , @Body() dto : ChangePasswordDto){
    const {userId} = req.user
    return this.profileService.changePassword(userId , dto)
  } 

}
