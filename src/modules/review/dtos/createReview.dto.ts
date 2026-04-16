import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {

  @IsString()
  appointmentId :string


  @IsInt()
  @Transform(({ value }) => Number(value))
  @Min(0)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
