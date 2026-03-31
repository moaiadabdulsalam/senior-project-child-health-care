import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(data: Prisma.PaymentUncheckedCreateInput) {
    return await this.prisma.payment.create({ data });
  }

  async updatePayment(data: Prisma.PaymentUpdateInput, id: string) {
    return await this.prisma.payment.update({
      where: {
        id,
      },
      data,
    });
  }
}
