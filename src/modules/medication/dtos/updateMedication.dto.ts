import { PartialType } from '@nestjs/swagger';
import { CreateMedicationDto } from './createMedication.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateMedicationDto extends PartialType(CreateMedicationDto) {}
