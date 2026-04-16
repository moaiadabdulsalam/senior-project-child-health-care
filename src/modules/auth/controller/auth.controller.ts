import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDoctorDto } from '../dtos/registerDoctor.dto';
import { RegisterParentDto } from '../dtos/registerParent.dto';
import { LoginDto } from '../dtos/login.dto';
import { SendEmailDto } from '../dtos/sendEmail';
import { VerifyOtpDto } from '../dtos/verifyOtp.dto';
import { ResetPasswordDto } from '../dtos/resetPassword.dto';
import { CookieService } from '../services/cookie.service';
import { Response } from 'express';
import { JwtAuthGuard } from '../guard/jwt.guard';
import { RefreshTokenGuard } from '../guard/refreshToken.guard';
import { SkipThrottle, Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Post('/register-doctor')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'certificates', maxCount: 1 },
    ]),
  )
  registerDoctor(
    @Body() dto: RegisterDoctorDto,
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    },
  ) {
    return this.authService.registerDoctor(dto, files);
  }

  @Post('/register-parent')
  @UseInterceptors(FileInterceptor('image'))
  registerParent(
    @Body() dto: RegisterParentDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.authService.registerParent(dto, file);
  }

  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('/login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);

    this.cookieService.setRefreshToken(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Post('/forgot-password')
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  forgetPassword(@Body() email: SendEmailDto) {
    return this.authService.sendOtp(email);
  }

  @Post('/verify-code')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('/reset-password/:id')
  resetPassword(@Body() dto: ResetPasswordDto, @Param() id: string) {
    return this.authService.resetPassword(dto, id);
  }

  @UseGuards(RefreshTokenGuard)
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('/refresh-token')
  async refreshToken(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { userId, refreshToken } = req.user;
    const result = await this.authService.refresh(userId, refreshToken);
    this.cookieService.setRefreshToken(res, result.refreshToken);

    return { accessToken: result.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { userId } = req.user;
    await this.authService.logout(userId);
    this.cookieService.clearRefreshToken(res);
    return {
      message: 'Logged out successfuly',
    };
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  @Get('me')
  async getMe(@Req() req) {
    return req.user;
  }

  @Post('/resend-otp')
  @Throttle({ default: { limit: 1, ttl: 60_000 } })
  resendOtp(@Body() email: SendEmailDto) {
    return this.authService.resendOtp(email);
  }
}
