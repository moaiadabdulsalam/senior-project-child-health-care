import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto } from '../dtos/createAppointment.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import {
  Appointment,
  AppointmentStatus,
  DoctorStatus,
  Exception,
  NotificationType,
  Prisma,
  Role,
} from '@prisma/client';
import { UpdateAppointmentDto } from '../dtos/updateAppointment.dto';
import { stat } from 'fs';
import { CancelAppointmentDto } from '../dtos/cancelAppointment.dto';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { AvailabilityPolicyRepository } from 'src/modules/availability-policy/repositories/availabilityPolicy.repositories';
import { ExceptionRepository } from 'src/modules/exception/repositories/exception.repositories';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly AppointmentRepo: AppointmentRepository,
    private userRepo: AuthRepository,
    private notificaiton: NotificationService,
    private readonly policy: AvailabilityPolicyRepository,
    private readonly excpetionRepo: ExceptionRepository,
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

  async getAppointmentsForParent(
    userId: string,
    page: number,
    limit: number,
    status?: AppointmentStatus,
    search?: string,
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

  async getAppointmentsForDoctor(userId: string, page: number, limit: number, search?: string) {
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
    const appointment = await this.AppointmentRepo.getOneAppointmentById(id);
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

  async getSlotPerDay(userId: string, date?: Date) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policy.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('policy require');
    }

    let beginWork = policy.startWork;
    let endWork = policy.endWork;
    let slot = policy.slot;

    let availiableDate = date ?? new Date();
    let breakEnd: Date = new Date(availiableDate);
    let breakStart: Date = new Date(availiableDate);
    if (policy.breakEnd && policy.breakStart) {
      breakStart.setHours(
        policy.breakStart.getHours(),
        policy.breakStart.getMinutes(),
        policy.breakStart.getSeconds(),
        policy.breakStart.getMilliseconds(),
      );

      breakEnd.setHours(
        policy.breakEnd.getHours(),
        policy.breakEnd.getMinutes(),
        policy.breakEnd.getSeconds(),
        policy.breakEnd.getMilliseconds(),
      );
    }
    let begin = new Date(availiableDate);
    begin.setHours(
      beginWork.getHours(),
      beginWork.getMinutes(),
      beginWork.getSeconds(),
      beginWork.getMilliseconds(),
    );
    let end = new Date(availiableDate);
    end.setHours(
      endWork.getHours(),
      endWork.getMinutes(),
      endWork.getSeconds(),
      endWork.getMilliseconds(),
    );

    const arrayOfSlot: { date: Date; break: boolean | Exception; book: Appointment | null }[] = [];

    while (begin < end) {
      let breakCheck: Exception | boolean = false;

      if (breakStart && breakEnd && begin >= breakStart && begin < breakEnd) {
        breakCheck = true;
      }

      const exception = await this.excpetionRepo.getException({
        startTime: {
          lte: begin,
        },
        endTime: {
          gte: begin,
        },
      });
      if (exception) {
        breakCheck = exception;
      }
      const where: Prisma.AppointmentWhereInput = {
        date: begin,
      };
      const appointment = await this.AppointmentRepo.getOneAppointment(where);
      arrayOfSlot.push({ date: new Date(begin), break: breakCheck, book: appointment ?? null });
      begin.setMinutes(begin.getMinutes() + slot);
    }

    return arrayOfSlot;
  }

  async getSlotPerMonth(userId: string, date?: Date) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policy.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('policy require');
    }
    const availiableDate = date ?? new Date();
    const numberOfDays = new Date(
      availiableDate.getFullYear(),
      availiableDate.getMonth() + 1,
      0,
    ).getDate();
    const result: { date: Date; break: boolean | Exception; book: Appointment | null }[][] = [];
    for (let i = 1; i <= numberOfDays; i++) {
      const day = new Date(availiableDate.getFullYear(), availiableDate.getMonth(), i);
      const slotAllDay = await this.getSlotPerDay(userId, day);
      result.push(slotAllDay);
    }
    return result;
  }
}
