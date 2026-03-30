import { MedicationStatus, MedicineUnit } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMedicationDto {

  @IsString()
  @IsNotEmpty()
  childId: string

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
  Duration: string;/// في  الايام

  @IsString()
  @IsNotEmpty()
  amountPerDay: string;

  @IsDateString()
  firstDoseTime: string; // وقت البدء بالساعات

  @IsDateString()
  firstDoseDate: string;//وقت البدء بالتاريخ

  @IsString()
  @IsNotEmpty()
  rememberTime: string;/// في الدقائق

  @IsEnum(MedicationStatus)
  status: MedicationStatus;
}
