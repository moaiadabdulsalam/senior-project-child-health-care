import { Module, ParseIntPipe } from '@nestjs/common';
import { DoctorsParentService } from './services/doctors-parent.service';
import { DoctorsParentController } from './controllers/doctors-parent.controller';
import { AuthModule } from '../auth/auth.module';
import { DoctorsParentRepository } from './repositories/doctorsParent.repositories';

@Module({
  imports:[AuthModule],
  providers: [DoctorsParentService, DoctorsParentRepository ,ParseIntPipe],
  controllers: [DoctorsParentController],
  exports : [DoctorsParentRepository]
})
export class DoctorsParentModule {}
