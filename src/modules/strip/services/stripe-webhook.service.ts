import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentStatus, NotificationType, PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';

@Injectable()
export class StripeWebhookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
    private readonly notification: NotificationService,
  ) {}

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripeService.client.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestException(`Webhook signature verification failed: ${error.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case 'checkout.session.expired': {
        await this.handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session);
        break;
      }

      default:
        break;
    }

    return { received: true };
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;
    const appointmentId = session.metadata?.appointmentId;

    if (!paymentId || !appointmentId) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { profileDoctor: true, profileParent: true },
      });

      if (!payment) return;

      if (payment.status === PaymentStatus.SUCCESS) {
        return;
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: {
          paidAt: new Date(),
          status: PaymentStatus.SUCCESS,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        },
      });

      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.CONFIRMED,
        },
      });
      await this.notification.create({
        type: NotificationType.APPOINTMENT_CONFIRMED,
        title: `New Appointment`,
        message: ` new Appointment ${payment.parentId}`,
        userId: payment.profileDoctor.userId,
        data: {
          payment,
          appointmentId,
        },
      });
      await this.notification.create({
        type: NotificationType.PAYMENT_SUCCESS,
        title: 'Payment completed successfully',
        message: 'payemnt completed and appointment booked',
        userId: payment.profileParent.userId,
        data: {
          payment,
        },
      });
    });
  }

  private async handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
    const paymentId = session.metadata?.paymentId;

    if (!paymentId) {
      return;
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        profileParent: true,
      },
    });

    if (!payment) {
      return;
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return;
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.EXPIRED,
      },
    });
    await this.notification.create({
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Expired ',
      message: 'payemnt expired please try again',
      userId: payment.profileParent.userId,
      data: {
        payment,
      },
    });
  }
}
