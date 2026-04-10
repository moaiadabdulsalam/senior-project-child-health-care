import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MedicationService } from '../services/medication.service';
import { CreateMedicationDto } from '../dtos/createMedication.dto';
import { UpdateMedicationDto } from '../dtos/updateMedication.dto';
import { MedicationStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { MedicationDoseService } from '../services/medication-dose.service';
import { UpdateMedicationDoseDto } from '../dtos/updateDose.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Controller('medication')
export class MedicationController {
  constructor(
    private readonly medicationService: MedicationService,
    private readonly medicationDoseService: MedicationDoseService,
  ) {}

  @SkipThrottle()
  @Get()
  getAllMedication(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: MedicationStatus,
    @Query('childId') childId?: string,
  ) {
    const { userId } = req.user;
    return this.medicationService.getAllMedication(userId, page, limit, search, status, childId);
  }

  @Get('/reminder-details/:id')
  reminderDetails(@Param('id') id: string) {
    return this.medicationDoseService.getReminderDetails(id);
  }

  @Patch('/reminder-details/:id')
  updateSpecficReminderDetails(@Param('id') id: string, @Body() dto: UpdateMedicationDoseDto) {
    return this.medicationDoseService.updateDose(id, dto);
  }

  @Get('/:id')
  getOne(@Req() req, @Param('id') id: string) {
    return this.medicationService.getOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  createMedication(
    @Body() dto: CreateMedicationDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.medicationService.createMedication(dto, userId, file);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateMedication(
    @Param('id') id: string,
    @Body() dto: UpdateMedicationDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.medicationService.updateMedicaion(id, dto, userId, file);
  }

  @Delete('/:id')
  deleteMedication(@Param('id') id: string) {
    return this.medicationService.deleteMedication(id);
  }
}
