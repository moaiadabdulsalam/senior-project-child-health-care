import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterParentDto } from '../dtos/registerParent.dto';
import { RegisterDoctorDto } from '../dtos/registerDoctor.dto';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ProfileDoctorRepository } from '../repositories/profileDoctory.repository';
import { ProfileParentRepository } from '../repositories/profileParent.repository';
import { LoginDto } from '../dtos/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SendEmailDto } from '../dtos/sendEmail';
import * as nodemailer from 'nodemailer';
import { RedisService } from 'src/redis/redis.service';
import { VerifyOtpDto } from '../dtos/verifyOtp.dto';
import { ResetPasswordDto } from '../dtos/resetPassword.dto';
import { DoctorStatus } from '@prisma/client';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly prisma: PrismaService,
    private readonly profileParentRepo: ProfileParentRepository,
    private readonly profileDoctoryRepo: ProfileDoctorRepository,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly redis: RedisService,
  ) {}

  private async signAccessToken(user: any) {
    if (!user) {
      throw new BadRequestException('Invalid user data for token generation');
    }
    const secret = this.config.get('JWT_SECRET');
    if (!secret) {
      throw new BadRequestException('Missing JWT_REFRESH_SECRET');
    }
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: '10m',
    });

    return accessToken;
  }

  private async signRefreshToken(user: any) {
    if (!user) {
      throw new BadRequestException('Invalid user data for token generation');
    }
    const secret = this.config.get('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new BadRequestException('Missing JWT_REFRESH_SECRET');
    }
    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const refreshToken = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: '7d',
    });

    return refreshToken;
  }
  private getTransporter() {
    return nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.config.get('SMTP_EMAIL'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendToEmail(email: string, html: string, subject: string) {
    try {
      const transporter = this.getTransporter();
      const fromEmail = this.config.get<string>('SMTP_EMAIL');
      if (!fromEmail) {
        throw new Error('Internal Server Error: Email configuration is missing.');
      }
      await transporter.sendMail({
        from: `"Dada" <${fromEmail}>`,
        to: email,
        subject,
        html,
      });
    } catch (error) {
      console.error('Email sending error:', error);
      if (error.code === 'EAUTH') {
        throw new BadRequestException(
          'SMTP authentication failed. Please check your email credentials.',
        );
      }
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        throw new BadRequestException('Failed to connect to email server. Please try again later.');
      }
      throw new BadRequestException('Failed to send email. Please try again later.');
    }
  }

  async registerParent(dto: RegisterParentDto) {
    const existing = await this.userRepo.findUserByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('email already in use');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await this.userRepo.registerUserInfo(
        {
          email: dto.email,
          passwordHash: hash,
          role: dto.role,
        },
        tx,
      );

      const parent = await this.profileParentRepo.registerParentInfo(
        {
          fullName: dto.fullName,
          fullNameArabic:dto.fullNameArabic??undefined,
          address: dto.address,
          addressArabic:dto.addressArabic??undefined,
          phone: dto.phone,
          user: {
            connect: { id: user.id },
          },
        },
        tx,
      );

      return { user, parent };
    });
  }

  async registerDoctor(dto: RegisterDoctorDto) {
    const existing = await this.userRepo.findUserByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('email already in use');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await this.userRepo.registerUserInfo(
        {
          email: dto.email,
          passwordHash: hash,
          role: dto.role,
          isActive: false,
        },
        tx,
      );
      const doctor = await this.profileDoctoryRepo.registerDoctorInfo(
        {
          speciality: dto.speciality,
          specialityArabic:dto.specialityArabic??undefined,
          clinicAddress: dto.clinicAddress,
          clinicNameArabic:dto.clinicAddressArabic??undefined,
          clinicPhone: dto.clinicPhone ?? '', //بعدل تعديلها في الداتا بيز
          clinicName: dto.clinicName,
          clinicAddressArabic:dto.clinicNameArabic??undefined,
          fullName: dto.fullName,
          fullNameArabic:dto.fullNameArabic??undefined,
          status: DoctorStatus.VERIFYING,
          description: dto.description,
          phone: dto.phone,
          user: {
            connect: { id: user.id },
          },
        },
        tx,
      );

      return { user, doctor };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException("email or password doesn't exist");
    }

    const comaprePassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!comaprePassword) {
      throw new BadRequestException("email or password doesn't exist");
    }
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.userRepo.updateUserRefreshToken(user.id, hashedRefreshToken);

    return { accessToken, refreshToken, user: { email: user.email, role: user.role } };
  }
  async sendOtp(dto: SendEmailDto) {
    const user = await this.userRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    await this.redis.set(`otp:${dto.email}`, hashedOtp, 300);
    const html = `<p>Your Code is: <h2>${otp}</h2></p>`;
    const subject = 'Password reset';
    await this.sendToEmail(dto.email, html, subject);

    return {
      message: ' Otp Send ',
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const storedOtp = await this.redis.get(`otp:${dto.email}`);

    if (!storedOtp) {
      throw new BadRequestException('Otp expire');
    }

    const isMatch = await bcrypt.compare(dto.otp, storedOtp);

    if (!isMatch) {
      throw new BadRequestException('Invalid Otp');
    }

    await this.redis.delete(`otp:${dto.email}`);

    return {
      message: 'OTP Verified',
    };
  }

  async resetPassword(dto: ResetPasswordDto, id: string) {
    if (dto.ConfirmNewPassword !== dto.newPassword) {
      throw new BadRequestException('passwords you entered do not match');
    }

    const hash = await bcrypt.hash(dto.newPassword, 10);

    await this.userRepo.updateUserPassword(id, hash);

    return {
      message: 'password reset successfuly',
    };
  }

  async logout(userId: string) {
    await this.userRepo.updateUserRefreshToken(userId, null);
    return {
      message: 'Logged out successfuly',
    };
  }

  async refresh(userId: string, refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const user = await this.userRepo.findUserById(userId);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Access Denied');
    }
    const isRefreshedTokenValid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!isRefreshedTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.signAccessToken(user);
    const newRefreshToken = await this.signRefreshToken(user);

    const hashRefresh = await bcrypt.hash(newRefreshToken, 10);

    await this.userRepo.updateUserRefreshToken(user.id, hashRefresh);

    return { refreshToken: newRefreshToken, accessToken };
  }

  async resendOtp(dto: SendEmailDto) {
    const user = await this.userRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await this.redis.set(`otp:${dto.email}`, hashedOtp, 300);
    const subject = 'Password reset';
    const html = `<p>Your Code is: <h2>${otp}</h2></p>`;
    await this.sendToEmail(dto.email, html, subject);
    return {
      message: 'Otp Resend',
    };
  }
}
