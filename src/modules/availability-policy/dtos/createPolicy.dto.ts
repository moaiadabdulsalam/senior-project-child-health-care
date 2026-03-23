import { WeekDay } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, Matches, Min } from 'class-validator';

export class CreatePolicyDto {
  @IsDateString()
  startWork: string;
  @IsDateString()
  endWork: string;

  @IsEnum(WeekDay, { each: true })
  weeklyOffDays: WeekDay[];

  @Min(1)
  slot: number;

  @IsOptional()
  @IsDateString()
  breakStart?: string;

  @IsOptional()
  @IsDateString()
  breakEnd?: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  sessionPrice: string;
}
