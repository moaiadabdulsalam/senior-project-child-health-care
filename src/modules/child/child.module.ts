import { Module } from '@nestjs/common';
import { ChildService } from './services/child.service';
import { ChildController } from './controller/child.controller';
import { ChildRepository } from './repositories/child.repository';

@Module({
  providers: [ChildService , ChildRepository],
  controllers: [ChildController]
})
export class ChildModule {}
