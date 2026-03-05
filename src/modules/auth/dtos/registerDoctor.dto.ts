

import { DoctorStatus, Role } from '@prisma/client';
import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString , MinLength} from 'class-validator'

export class RegisterDoctorDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
  
    @IsEnum(Role)
    @IsString()
    @IsNotEmpty()
    role: Role;
    
    @IsString()
    @IsNotEmpty()
    fullName: string;
    
    @IsString()
    phone: string;

    @IsString()
    @IsNotEmpty()
    speciality:string 

    @IsString()
    @IsOptional()
    description? : string

    @IsString()
    @IsOptional()
    clinicAddress?: string 

    @IsString()
    @IsOptional()
    clinicPhone?: string

    @IsString()
    @IsOptional()
    clinicName?:string 

    @IsString()
    @IsEnum(DoctorStatus)
    status :DoctorStatus
}