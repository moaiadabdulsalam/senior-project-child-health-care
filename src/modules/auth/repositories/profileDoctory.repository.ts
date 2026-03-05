import { Injectable } from '@nestjs/common';
import { Prisma, ProfileDoctor } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ProfileDoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerDoctorInfo(
    data: Prisma.ProfileDoctorCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ProfileDoctor> {
    const client = tx ?? this.prisma;
    return client.profileDoctor.create({
      data,
    });
  }
}
