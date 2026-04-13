import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExtendChildSessionDto {
  @IsNotEmpty()
  @IsInt()
  @Min(5)
  @Max(60)
  @Transform(({value})=>Number(value))
  extraMinutes: number;
}
