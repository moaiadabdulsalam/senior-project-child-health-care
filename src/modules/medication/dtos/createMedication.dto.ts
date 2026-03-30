import { MedicationStatus, MedicineUnit } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {

  @IsString()
  @IsNotEmpty()  
  medicineName: string;

  @IsString()
  @IsOptional()
  mdeicineNameArabic?: string;

  @IsEnum(MedicineUnit)
  medicineUnit: MedicineUnit;

  @IsString()
  @IsNotEmpty()
  medicineAmount: string;

  @IsDateString()
  Duration: string;

  @IsString()
  @IsNotEmpty()
  amountPerDay: string;

  @IsDateString()
  firstDoseTime: string;

  @IsDateString()
  firstDoseDate: string;

  @IsString()
  @IsNotEmpty()
  rememberTime: string;
  

  @IsEnum(MedicationStatus)
  status: MedicationStatus;
}
