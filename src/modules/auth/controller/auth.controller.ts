import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDoctorDto } from '../dtos/registerDoctor.dto';
import { RegisterParentDto } from '../dtos/registerParent.dto';
import { LoginDto } from '../dtos/login.dto';
import { forgotPasswordEmailDto } from '../dtos/forgotPasswordEmail.dto';
import { VerifyOtpDto } from '../dtos/verifyOtp.dto';
import { ResetPasswordDto } from '../dtos/resetPassword.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register-doctor')
  registerDoctor(@Body() dto: RegisterDoctorDto) {
    return this.authService.registerDoctor(dto);
  }

  @Post('/register-parent')
  registerParent(@Body() dto: RegisterParentDto) {
    return this.authService.registerParent(dto);
  }

  @Post('/login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('/forgot-password')
  forgetPassword(@Body() email: forgotPasswordEmailDto) {
    return this.authService.forgotPassword(email);
  }

  @Post('/verify-code')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('/reset-password/:id')
  resetPassword(@Body() dto: ResetPasswordDto, @Param() id: string) {
    return this.authService.resetPassword(dto, id);
  }
}
