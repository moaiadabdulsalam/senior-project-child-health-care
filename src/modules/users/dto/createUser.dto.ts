import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
