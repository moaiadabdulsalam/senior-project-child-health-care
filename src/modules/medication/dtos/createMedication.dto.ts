import { MedicationStatus, MedicineUnit } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MIN } from 'class-validator';

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
  duration: string;/// في  الايام

  @IsNotEmpty()
  @IsInt()
  amountPerDay: number;

  @IsDateString()
  firstDoseTime: string; // وقت البدء بالساعات

  @IsDateString()
  firstDoseDate: string;//وقت البدء بالتاريخ


  @IsBoolean()
  @IsOptional()
  rememberNotify? : boolean = false


  @IsEnum(MedicationStatus)
  status: MedicationStatus;

}
