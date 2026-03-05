import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDoctorDto } from '../dtos/registerDoctor.dto';
import { RegisterParentDto } from '../dtos/registerParent.dto';
import { LoginDto } from '../dtos/login.dto';

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
  forgetPassword() {}

  @Post('verify-code')
  verifyOtp() {}

  @Post('/reset-password')
  resetPassword() {}
}
