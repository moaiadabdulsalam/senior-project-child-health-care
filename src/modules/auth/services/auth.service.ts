import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import { forgotPasswordEmailDto } from '../dtos/forgotPasswordEmail.dto';
import * as nodemailer from 'nodemailer';
import { RedisService } from 'src/redis/redis.service';
import { VerifyOtpDto } from '../dtos/verifyOtp.dto';
import { ResetPasswordDto } from '../dtos/resetPassword.dto';

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

  private async signJwt(user: any) {
    if (!user) {
      throw new BadRequestException('Invalid user data for token generation');
    }
    const secret = this.config.get('JWT_SECRET');
    const payload = {
      userId: user.id,
      role: user.role,
    };

    const accessToken = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: '10m',
    });

    return accessToken;
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

  async sendOtp(email: string, otp: string) {
    try {
      const transporter = this.getTransporter();
      const fromEmail = this.config.get<string>('SMTP_EMAIL');
      if (!fromEmail) {
        throw new Error('Internal Server Error: Email configuration is missing.');
      }
      await transporter.sendMail({
        from: `"APP Name" <${fromEmail}>`,
        to: email,
        subject: 'Password reset',
        html: `<p>Your Code is: <h2>${otp}</h2></p>`,
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
          address: dto.address,
          phone: dto.phone,
          user: {
            connect: { id: user.id },
          },
        },
        tx,
      );
      const accessToken = await this.signJwt(user);
      return { accessToken, user, parent };
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
        },
        tx,
      );
      const doctor = await this.profileDoctoryRepo.registerDoctorInfo(
        {
          speciality: dto.speciality,
          clinicAddress: dto.clinicAddress,
          clinicPhone: dto.clinicPhone ?? '', //بعدل تعديلها في الداتا بيز
          clinicName: dto.clinicName,
          fullName: dto.fullName,
          status: dto.status,
          description: dto.description,
          phone: dto.phone,
          user: {
            connect: { id: user.id },
          },
        },
        tx,
      );
      const accessToken = await this.signJwt(user);

      return { accessToken, user, doctor };
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
    const accessToken = await this.signJwt(user);

    return { accessToken, email: user.email, role: user.role };
  }

  async forgotPassword(dto: forgotPasswordEmailDto) {
    const user = await this.userRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('email not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedOtp = await bcrypt.hash(otp , 10)

    await this.redis.set(`otp:${dto.email}`, hashedOtp, 300);

    await this.sendOtp(dto.email, otp);

    return {
      message: ' Otp Send ',
    };

  }

  async verifyOtp(dto: VerifyOtpDto) {
    const storedOtp = await this.redis.get(`otp:${dto.email}`);

    if (!storedOtp) {
      throw new BadRequestException('Otp expire');
    }
    
    const isMatch = await bcrypt.compare(dto.otp , storedOtp)

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


}
