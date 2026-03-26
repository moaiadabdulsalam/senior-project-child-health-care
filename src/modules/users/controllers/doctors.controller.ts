import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import { Roles } from 'src/core/decorator/role.decorator';
import { RoleGuard } from 'src/core/guard/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { CreateDoctorDto } from '../dto/createUser.dto';
import { DoctorsService } from '../services/doctors.service';
import { UpdateActivityDto } from '../dto/updateActivity.dto';
import { AnswerRequestDto } from '../dto/answerRequest.dto';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.ADMIN)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  getAllDoctors() {
    return this.doctorsService.getAllDoctors();
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.doctorsService.getOne(id);
  }

  @Get('/requestDoctor')
  requestDoctor(){
    return  this.doctorsService.getRequestDoctor()
  }

  @Patch('/requestDoctor/:id')
  answerRequest(@Body() dto: AnswerRequestDto , @Param('id') id : string){
    return this.doctorsService.answerRequeset( id ,dto)
  }

  @Post()
  createDoctor(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(dto);
  }

  @Patch('/:id')/////user id always
  updateDoctorsActivity(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.doctorsService.updateDoctorsActivity(id, dto);
  }
  
}
