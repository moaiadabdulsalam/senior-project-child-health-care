import { Module } from '@nestjs/common';
import { PublicLandingController } from './public-landing.controller';
import { PublicLandingService } from './public-landing.service';

@Module({
  controllers: [PublicLandingController],
  providers: [PublicLandingService],
})
export class PublicLandingModule {}
