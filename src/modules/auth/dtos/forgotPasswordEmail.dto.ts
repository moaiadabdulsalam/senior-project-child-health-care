import { IsEmail, IsNotEmpty } from 'class-validator';

export class forgotPasswordEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
