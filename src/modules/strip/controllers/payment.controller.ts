import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { throttle } from 'rxjs';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.PARENT)
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('checkout/:appointmentId')
  async checkout(@Param('appointmentId') appointmentId: string, @Req() req) {
    return this.paymentService.createCheckoutSession(appointmentId, req.user.userId);
  }

  @Get('status/:appointmentId')
  async getStatus(@Param('appointmentId') appointmentId: string, @Req() req) {
    this.paymentService.getPaymentStatusByAppointment(appointmentId, req.user.userId);
  }
}
