import { BadRequestException, Injectable } from '@nestjs/common';
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
import { rootCertificates } from 'tls';
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly prisma: PrismaService,
    private readonly profileParentRepo: ProfileParentRepository,
    private readonly profileDoctoryRepo: ProfileDoctorRepository,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
  ) {}

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
      return { user, doctor };
    });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findUserByEmail(dto.email);
    if (!user) {
      throw new BadRequestException("email or password doesn't exist");
    }

    const comaprePassword = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!comaprePassword) {
      throw new BadRequestException("email or password doesn't exist");
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

    return { accessToken, email: user.email, role: user.role };
  }
  
}
