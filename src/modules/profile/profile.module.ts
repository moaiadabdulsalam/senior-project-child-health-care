import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { AuthModule } from '../auth/auth.module';
import {  ProfileRepository } from './repositories/Profile.repositories';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [AuthModule , UploadModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository],
})
export class ProfileModule {}
