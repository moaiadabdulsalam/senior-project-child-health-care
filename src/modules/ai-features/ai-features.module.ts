import { Module } from '@nestjs/common';
import { AiFeaturesController } from './controllers/ai-features.controller';

@Module({
  controllers: [AiFeaturesController]
})
export class AiFeaturesModule {}
