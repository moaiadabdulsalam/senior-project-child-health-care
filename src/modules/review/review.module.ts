import { forwardRef, Module } from '@nestjs/common';
import { ReviewService } from './services/review.service';
import { ReviewController } from './controllers/review.controller';
import { AuthModule } from '../auth/auth.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { ReviewRepository } from './repositories/review.repositories.dto';
import { DoctorsParentModule } from '../doctors-parent/doctors-parent.module';

@Module({
  imports : [AuthModule,forwardRef(()=>AppointmentModule) , DoctorsParentModule],
  providers: [ReviewService,ReviewRepository],
  controllers: [ReviewController],
  exports : [ReviewRepository , ReviewService]
})
export class ReviewModule {}
