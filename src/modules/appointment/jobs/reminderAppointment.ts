import { Injectable, Logger } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { Cron } from '@nestjs/schedule';
import { AppointmentStatus, NotificationType, Prisma } from '@prisma/client';

@Injectable()
export class AppointmentReminder {
  private readonly logger = new Logger(AppointmentReminder.name);
  constructor(
    private readonly appointmentRepo: AppointmentRepository,
    private readonly notification: NotificationService,
  ) {}

  @Cron('* * * * *')
  async handleReminders() {
    this.logger.log('Running reminder scheduler...');
    await this.handleAppointmentReminders();
  }

  private async handleAppointmentReminders() {
    const now = new Date();
    const from = new Date(now.getTime() + 30 * 60 * 1000 - 30 * 1000);

    const to = new Date(now.getTime() + 30 * 60 * 1000 + 30 * 1000);
    const where: Prisma.AppointmentWhereInput = {
      date: {
        gte: from,
        lte: to,
      },
      status: {
        in: [AppointmentStatus.CONFIRMED],
      },
      reminderSent: false,
    };
    const appointments = await this.appointmentRepo.getAppointment(where);

    for (const appointment of appointments) {
      const parentId = appointment.profileParent.userId;
      await this.notification.create({
        userId: parentId,
        title: 'تذكير بالموعد',
        message: `لدى ${appointment.child.fullName} موعد بعد 30 دقيقة.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        data: {
          reminderKind: 'appointment',
          appointmentId: appointment.id,
          childId: appointment.childId,
          doctorId: appointment.doctorId,
        },
      });
      const doctorId = appointment.profileDoctor.userId;
      await this.notification.create({
        userId: doctorId,
        title: 'تذكير بالموعد',
        message: `لديك موعد مع ${appointment.child.fullName} بعد 30 دقيقة.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        data: {
          reminderKind: 'appointment',
          appointmentId: appointment.id,
          childId: appointment.childId,
          parentId: appointment.parentId,
        },
      });
      await this.appointmentRepo.updateAppointment(
        {
          reminderSent: true,
        },
        appointment.id,
      );
    }
  }
}
