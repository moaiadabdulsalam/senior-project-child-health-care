import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const connectionString = config.get('DATABASE_URL');
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool as any);
    super({
      adapter,
    });
  }
}
