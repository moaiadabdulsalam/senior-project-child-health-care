import {
  Body,
  Controller,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UpdateDoctorProfileDto } from '../dtos/updateDoctorProfile.dto';
import { ProfileService } from '../services/profile.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { UpdateParentProfileDto } from '../dtos/updateParentProfile.dto';
import { ChangePasswordDto } from '../dtos/changePass.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { RequireUpdateProfileDoctorDto } from '../dtos/requireUpdateDoctorProfile.dto';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Roles(Role.DOCTOR)
  @Patch('/doctor')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'certificates', maxCount: 1 },
    ]),
  )
  updateDoctorProfile(
    @Req() req,
    @Body() dto: UpdateDoctorProfileDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    const { userId } = req.user;
    return this.profileService.updateDoctorProfile(userId, dto, files);
  }

  @Roles(Role.PARENT)
  @Patch('/parent')
  @UseInterceptors(FileInterceptor('image'))
  updateParentProfile(
    @Req() req,
    @Body() dto: UpdateParentProfileDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.profileService.updateParentProfile(userId, dto, file);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Roles(Role.PARENT, Role.DOCTOR, Role.ADMIN)
  @Patch('/change-password')
  changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    const { userId } = req.user;
    return this.profileService.changePassword(userId, dto);
  }

  @Roles(Role.DOCTOR)
  @Post('/requireUpdateProfile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'certificates', maxCount: 1 },
    ]),
  )
  requireUpdateDoctorProfile(
    @Req() req,
    @Body() dto: RequireUpdateProfileDoctorDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    const { userId } = req.user;
    return this.profileService.requireUpdateDoctorProfile(userId, dto, files);
  }
}
