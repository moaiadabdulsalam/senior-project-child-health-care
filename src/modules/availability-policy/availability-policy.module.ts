import { Module } from '@nestjs/common';
import { AvailabilityPolicyService } from './services/availability-policy.service';
import { AvailabilityPolicyController } from './controllers/availability-policy.controller';
import { AuthModule } from '../auth/auth.module';
import { AvailabilityPolicyRepository } from './repositories/availabilityPolicy.repositories';

@Module({
  imports: [AuthModule],
  controllers: [AvailabilityPolicyController],
  providers: [AvailabilityPolicyService, AvailabilityPolicyRepository],
  exports: [AvailabilityPolicyRepository],
})
export class AvailabilityPolicyModule {}
