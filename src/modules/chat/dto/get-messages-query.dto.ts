import { IsNumberString, IsOptional } from 'class-validator';

export class GetMessagesQueryDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}