import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto } from '../dtos/createAppointment.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AppointmentStatus, DoctorStatus, NotificationType, Prisma, Role } from '@prisma/client';
import { UpdateAppointmentDto } from '../dtos/updateAppointment.dto';
import { CancelAppointmentDto } from '../dtos/cancelAppointment.dto';
import { NotificationService } from 'src/modules/notification/services/notification.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly AppointmentRepo: AppointmentRepository,
    private userRepo: AuthRepository,
    private notificaiton: NotificationService,
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
  private async checkUserAndProfileDoctor(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const doctorProfile = user.profileDoctory;
    if (
      !doctorProfile ||
      doctorProfile.status !== DoctorStatus.CONFIRMING ||
      user.role !== Role.DOCTOR
    ) {
      throw new NotFoundException('doctor profile not found');
    }

    return doctorProfile.id;
  }

  private applyAppointmentDateRange(
    where: Prisma.AppointmentWhereInput,
    dateFrom?: string,
    dateTo?: string,
  ) {
    let gte: Date | undefined;
    let lte: Date | undefined;
    if (dateFrom?.trim()) {
      const [y, m, d] = dateFrom.split('-').map(Number);
      if (!y || !m || !d) throw new BadRequestException('dateFrom must be YYYY-MM-DD');
      gte = new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    if (dateTo?.trim()) {
      const [y, m, d] = dateTo.split('-').map(Number);
      if (!y || !m || !d) throw new BadRequestException('dateTo must be YYYY-MM-DD');
      lte = new Date(y, m - 1, d, 23, 59, 59, 999);
    }
    if (gte && lte && gte > lte) {
      throw new BadRequestException('dateFrom must be on or before dateTo');
    }
    if (gte || lte) {
      where.date = {
        ...(gte && { gte }),
        ...(lte && { lte }),
      };
    }
  }

  async getAppointmentsForParent(
    userId: string,
    page: number,
    limit: number,
    status?: AppointmentStatus,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const parentId = await this.checkUserAndProfileParent(userId);
    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      parentId,
      ...(status && { status }),
    };
    this.applyAppointmentDateRange(where, dateFrom, dateTo);
    const token = search?.trim();
    if (token?.length) {
      const raw = token.split(/\s+/);
      where.AND = raw.map((word) => ({
        OR: [
          {
            profileDoctor: {
              is: {
                OR: [
                  {
                    fullName: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullNameArabic: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
          {
            child: {
              is: {
                OR: [
                  {
                    fullName: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullNameArabic: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ],
      }));
    }

    const data = await this.AppointmentRepo.getAppointment(where, skip, limit);
    const count = await this.AppointmentRepo.count(where);

    return {
      data,
      meta: {
        page,
        limit,
        count,
        skip,
        pageTotal: Math.ceil(count / limit),
      },
    };
  }

  async getAppointmentsForDoctor(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    dateFrom?: string,
    dateTo?: string,
  ) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {
      doctorId,
    };
    this.applyAppointmentDateRange(where, dateFrom, dateTo);
    const token = search?.trim();
    if (token?.length) {
      const raw = token.split(/\s+/);
      where.AND = raw.map((word) => ({
        OR: [
          {
            profileParent: {
              is: {
                OR: [
                  {
                    fullName: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullNameArabic: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
          {
            child: {
              is: {
                OR: [
                  {
                    fullName: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                  {
                    fullNameArabic: {
                      contains: word,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        ],
      }));
    }

    const data = await this.AppointmentRepo.getAppointment(where, skip, limit);
    const count = await this.AppointmentRepo.count(where);

    return {
      data,
      meta: {
        page,
        limit,
        count,
        skip,
        pageTotal: Math.ceil(count / limit),
      },
    };
  }

  async getOne(id: string) {
    const appointment = await this.AppointmentRepo.getOneAppointment(id);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async createAppointment(userId: string, dto: CreateAppointmentDto) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const appointment = await this.AppointmentRepo.createAppointment({
      childId: dto.childId,
      parentId,
      doctorId: dto.doctorId,
      reason: dto.reason,
      notes: dto.notes ?? undefined,
      date: dto.date,
      status: AppointmentStatus.PENDING,
    });

    return appointment;
  }
  async updateAppointment(userId: string, id: string, dto: UpdateAppointmentDto) {
    await this.checkUserAndProfileParent(userId);
    const lastAppoinment = await this.getOne(id);
    const appointment = await this.AppointmentRepo.updateAppointment(
      {
        childId: dto.childId ?? undefined,
        reason: dto.reason ?? undefined,
        notes: dto.notes ?? undefined,
        date: dto.date ?? undefined,
        reminderSent: dto.date ? false : undefined,
      },
      id,
    );
    if (dto.date) {
      await this.notificaiton.create({
        title: 'appointment date updated',
        type: NotificationType.APPOINTMENT_UPDATE_DATE,
        message: `appointment date updated from ${lastAppoinment.date} to ${dto.date}`,
        senderId: appointment.profileParent.userId,
        userId: appointment.profileDoctor.userId,
        data: {
          appointmentId: appointment.id,
          doctorID: appointment.doctorId,
          parentId: appointment.parentId,
        },
      });
    }
    return appointment;
  }
  async deleteAppointment(id: string) {
    const appointment = await this.getOne(id);
    const deletedAppointment = await this.AppointmentRepo.deleteAppointment(id);
    if (appointment.status === AppointmentStatus.CONFIRMED) {
      ////refund
    }
    await this.notificaiton.create({
      title: 'appointment deleted',
      type: NotificationType.APPOINTMENT_DELETED,
      message: `appointment deleted from parent`,
      senderId: appointment.profileParent.userId,
      userId: appointment.profileDoctor.userId,
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        parentId: appointment.parentId,
      },
    });
    return {
      deletedAppointment,
      message: 'appointment deleted successfuly',
    };
  }
  async cancelAppointment(id: string, dto: CancelAppointmentDto) {
    const appointment = await this.getOne(id);
    await this.AppointmentRepo.updateAppointment(
      {
        status: AppointmentStatus.CANCELLED,
      },
      id,
    );
    await this.notificaiton.create({
      title: 'appointment canceled',
      type: NotificationType.APPOINTMENT_CANCELLED,
      message: `appointment caneled because ${dto.reason}`,
      senderId: appointment.profileDoctor.userId,
      userId: appointment.profileParent.userId,
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        parentId: appointment.parentId,
      },
    });

    return {
      message: 'appointment canceled successfully',
    };
  }
}
