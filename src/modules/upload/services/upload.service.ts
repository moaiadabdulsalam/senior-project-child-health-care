import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class UploadService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_KEY');
    const bucket = this.configService.get<string>('SUPABASE_BUCKET');

    if (!url || !key || !bucket) {
      throw new Error('Missing Supabase environment variables');
    }

    this.client = createClient(url, key);
    this.bucket = bucket;
  }

  private assertImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, WEBP, SVG are allowed');
    }
    let maxSize =  5;
    maxSize = maxSize * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`Max image size is ${maxSize / 1024 / 1024}MB`);
    }
  }

  async uploadImage(file: Express.Multer.File) {
    this.assertImage(file);
    const key = `${Date.now()}-${file.originalname}`;

    try {
      const {error } = await this.client.storage
        .from(this.bucket)
        .upload(key, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase Storage Error:', error);
        throw new BadRequestException(error.message);
      }

      const { data: publicData } = this.client.storage.from(this.bucket).getPublicUrl(key);
      return { key, url: publicData.publicUrl };
    } catch (err) {
      console.error('Full System Error:', err);
      throw new BadRequestException(`Upload connection failed: ${err.message}`);
    }
  }
}
