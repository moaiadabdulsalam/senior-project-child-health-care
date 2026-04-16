import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { GameSessionStatus } from '@prisma/client';

export class FinishGameSessionDto {


  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  durationSeconds?: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  score?: number;

  @IsInt()
  @Transform(({ value }) => Number(value))
  @IsOptional()
  levelReached?: number;

  @IsEnum(GameSessionStatus)
  status: GameSessionStatus;
}
