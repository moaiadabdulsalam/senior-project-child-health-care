import { Injectable } from '@nestjs/common';
import { Prisma, ProfileParent } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ProfileParentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registerParentInfo(
    data: Prisma.ProfileParentCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<ProfileParent> {
    const client = tx ?? this.prisma;
    return client.profileParent.create({
      data,
    });
  }
}
