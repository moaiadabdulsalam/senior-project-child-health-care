import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, Currency, PaymentStatus, Prisma, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { StripeService } from './stripe.service';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AppointmentRepository } from 'src/modules/appointment/repositories/appointment.repository';
import { AvailabilityPolicyRepository } from 'src/modules/availability-policy/repositories/availabilityPolicy.repositories';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly userRepo: AuthRepository,
    private readonly appointmentRepo: AppointmentRepository,
    private readonly policyRepo: AvailabilityPolicyRepository,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  private async checkUserAndProfileParent(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const parentProfile = user.profileParent;
    if (!parentProfile || user.role !== Role.PARENT) {
      throw new NotFoundException('parent profile not found');
    }

    return parentProfile.id;
  }
  async createCheckoutSession(appointmentId: string, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const appointment = await this.appointmentRepo.getAppointmentForPayment(
      appointmentId,
      parentId,
    );
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.status === AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Appointment already confirmed');
    }

    if (appointment.payment?.status === PaymentStatus.SUCCESS) {
      throw new BadRequestException('Appointment already paid');
    }

    const amountFromDoctorPolicy = await this.policyRepo.getUniquePolicy(appointment.doctorId);
    if (!amountFromDoctorPolicy) {
      throw new BadRequestException('session price not configuration');
    }
    const amount = amountFromDoctorPolicy.sessionPrice;

    const currency = appointment.payment?.currency ?? Currency.USD;

    let payment = appointment.payment;

    if (!payment) {
      payment = await this.paymentRepo.createPayment({
        parentId,
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        amount,
        currency,
        status: PaymentStatus.PENDING,
      });
    }

    const successUrl = this.configService.getOrThrow<string>('STRIPE_SUCCESS_URL');
    const cancelUrl = this.configService.getOrThrow<string>('STRIPE_CANCEL_URL');
    // console.log('payment.amount =', payment.amount);
    // console.log('unit_amount =', Number(payment.amount) * 100);
    // console.log('doctor session price =', amountFromDoctorPolicy.sessionPrice);
    const session = await this.stripeService.client.checkout.sessions.create({
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        appointmentId: appointment.id,
        paymentId: payment.id,
        parentId,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Number(payment.amount) * 100,
            product_data: {
              name: 'Doctor Appointment',
              description: `Appointment ID: ${appointment.id}`,
            },
          },
        },
      ],
    });

    await this.paymentRepo.updatePayment({ stripeSessionId: session.id }, payment.id);

    if (appointment.status !== AppointmentStatus.PENDING_PAYMENT) {
      await this.appointmentRepo.updateAppointment(
        { status: AppointmentStatus.PENDING_PAYMENT },
        appointment.id,
      );
    }

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }
  async getPaymentStatusByAppointment(appointmentId: string, parentId: string) {
    const appointment = await this.appointmentRepo.getAppointmentForPayment(
      appointmentId,
      parentId,
    );

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return {
      appointmentId: appointment.id,
      appointmentStatus: appointment.status,
      payment: appointment.payment,
    };
  }
}
