import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private redis: Redis;

  constructor(private readonly config: ConfigService) {
    this.redis = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: this.config.get('REDIS_PORT'),
    });
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
