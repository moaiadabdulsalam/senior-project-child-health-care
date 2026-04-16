import { DoctorStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateDoctorProfileDto {

  @IsOptional()
  fullName?: string;
  @IsOptional()
  fullNameArabic?: string;
  @IsOptional()
  speciality?: string;
  @IsOptional()
  specialityArabic?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  phone?: string;
  @IsOptional()
  clinicPhone?: string;
  @IsOptional()
  clinicAddress?: string;
  @IsOptional()
  clinicAddressArabic?: string;
  @IsOptional()
  clinicName?: string;
  @IsOptional()
  clinicNameArabic?: string;
 
}
