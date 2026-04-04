import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentController } from './controllers/payment.controller';
import { PaymentService } from './services/payment.service';
import { StripeService } from './services/stripe.service';
import { StripeWebhookService } from './services/stripe-webhook.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StripeWebhookController } from './controllers/stripe-webhook.controller';
import { AuthModule } from '../auth/auth.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { AvailabilityPolicyModule } from '../availability-policy/availability-policy.module';
import { PaymentRepository } from './repositories/payment.repository';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    AuthModule,
    AppointmentModule,
    AvailabilityPolicyModule,
    NotificationModule,
  ],
  controllers: [PaymentController, StripeWebhookController],
  providers: [
    PaymentService,
    StripeService,
    StripeWebhookService,
    PrismaService,
    PaymentRepository,
  ],
  exports: [PaymentService, StripeService],
})
export class StripeModule {}
