import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { IFileStorage, UploadedFileResult } from '../interfaces/file-storage.interface';

@Injectable()
export class SupabaseChatStorageProvider implements IFileStorage {
  private readonly supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  private readonly bucket = process.env.SUPABASE_CHAT_BUCKET || 'chat-files';

  async uploadChatFile(file: Express.Multer.File): Promise<UploadedFileResult> {
    const ext = file.originalname.split('.').pop();
    const key = `chat/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(key);

    return {
      url: data.publicUrl,
      key,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    };
  }
}