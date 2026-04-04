import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ChildLoginDto {
  @ValidateIf((o) => !o.fullNameArabic)
  @IsString()
  @IsOptional()
  fullName?: string;

  @ValidateIf((o) => !o.fullName)
  @IsString()
  @IsOptional()
  fullNameArabic?: string;

  @IsString()
  @IsNotEmpty()
  loginHandle: string;
}
