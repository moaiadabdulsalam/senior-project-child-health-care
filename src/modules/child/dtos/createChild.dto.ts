import { Gender, Role } from '@prisma/client';
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChildDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsOptional()
  @IsString()
  fullNameArabic?: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsOptional()
  bloodType?: string;

  @IsString()
  @IsNotEmpty()
  loginHandle: string;

  @IsBoolean()
  isActive?: boolean = true;

  @IsEnum(Role)
  role: Role;
}
