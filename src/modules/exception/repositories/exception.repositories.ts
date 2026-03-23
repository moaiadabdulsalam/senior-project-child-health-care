import { Injectable } from '@nestjs/common';
import { Exception, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ExceptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllExceptions(where: Prisma.ExceptionWhereInput): Promise<Exception[]> {
    return await this.prisma.exception.findMany({
      where,
    });
  }

  async getException(where: Prisma.ExceptionWhereInput): Promise<Exception | null> {
    return await this.prisma.exception.findFirst({
      where,
    });
  }

  async countException(where: Prisma.ExceptionWhereInput) {
    return await this.prisma.exception.count({
      where,
    });
  }

  async getOneException(id: string, doctorId: string): Promise<Exception | null> {
    return await this.prisma.exception.findFirst({
      where: {
        id,
        doctorId,
      },
    });
  }

  async createException(data: Prisma.ExceptionCreateInput): Promise<Exception> {
    return await this.prisma.exception.create({ data });
  }

  async updateException(data: Prisma.ExceptionUpdateInput, id: string): Promise<Exception> {
    return await this.prisma.exception.update({
      where: { id },
      data,
    });
  }
  async deleteException(id: string): Promise<Exception> {
    return await this.prisma.exception.delete({
      where: { id },
    });
  }
}
