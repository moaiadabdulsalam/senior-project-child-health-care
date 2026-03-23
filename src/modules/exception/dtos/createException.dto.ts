import { ExceptionType } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateExceptionDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsEnum(ExceptionType)
  type: ExceptionType;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
