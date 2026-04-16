import { DoctorStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequireUpdateProfileDoctorDto {

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  fullNameArabic?: string;

  @IsString()
  @IsNotEmpty()
  speciality: string;

  @IsOptional()
  @IsString()
  specialityArabic?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  clinicPhone?: string;

  @IsOptional()
  @IsString()
  clinicAddress?: string;

  @IsOptional()
  @IsString()
  clinicAddressArabic?: string;

  @IsOptional()
  @IsString()
  clinicName?: string;

  @IsOptional()
  @IsString()
  clinicNameArabic?: string;


}
