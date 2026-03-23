import { Injectable } from '@nestjs/common';
import { AvailabilityPolicy, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AvailabilityPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUniquePolicy(doctorId: string): Promise<AvailabilityPolicy | null> {
    return await this.prisma.availabilityPolicy.findUnique({
      where: {
        doctorId,
      },
    });
  }

  async createPolicy(data: Prisma.AvailabilityPolicyCreateInput): Promise<AvailabilityPolicy> {
    return await this.prisma.availabilityPolicy.create({
      data,
    });
  }

  async updatePolicy(
    data: Prisma.AvailabilityPolicyUpdateInput,
    doctorId: string,
  ): Promise<AvailabilityPolicy> {
    return await this.prisma.availabilityPolicy.update({
      where: {
        doctorId,
      },
      data,
    });
  }
}
