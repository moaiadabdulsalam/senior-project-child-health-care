import { Module, ParseIntPipe } from '@nestjs/common';
import { ChildService } from './services/child.service';
import { ChildController } from './controller/child.controller';
import { ChildRepository } from './repositories/child.repository';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [AuthModule , UploadModule],
  providers: [ChildService, ChildRepository , ParseIntPipe],
  controllers: [ChildController],
  exports:[ChildService]
})
export class ChildModule {}
