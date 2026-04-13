import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import 'dotenv/config';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis(this.config.getOrThrow('REDIS_URL'));
    
  }
  async set(key: string, value: string, ttl: number) {
    await this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string): Promise<string | null> {
    return await this.redis.get(key);
  }

  async delete(key: string) {
    await this.redis.del(key);
  }
}
