import { IsBoolean } from 'class-validator';

export class UpdateActivityDto {
  @IsBoolean()
  isActive: boolean;
}
