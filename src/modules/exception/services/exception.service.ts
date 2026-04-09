import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DoctorStatus, ExceptionType, NotificationType, Prisma, Role } from '@prisma/client';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AvailabilityPolicyRepository } from 'src/modules/availability-policy/repositories/availabilityPolicy.repositories';
import { ExceptionRepository } from '../repositories/exception.repositories';
import { CreateExceptionDto } from '../dtos/createException.dto';
import { UpdateExcpetionDto } from '../dtos/updateException.dto';
import { AppointmentRepository } from 'src/modules/appointment/repositories/appointment.repository';
import { NotificationService } from 'src/modules/notification/services/notification.service';
import { mpJsDayToWeek } from 'src/common/utils/date.util';

@Injectable()
export class ExceptionService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly policy: AvailabilityPolicyRepository,
    private readonly exceptionRepo: ExceptionRepository,
    private readonly appointmentRepo: AppointmentRepository,
    private readonly notification: NotificationService,
  ) {}

  private async checkUserAndProfileDoctor(userId: string) {
    const user = await this.userRepo.findUserById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const doctorProfile = user.profileDoctory;
    if (!doctorProfile || doctorProfile.status !== DoctorStatus.CONFIRMING) {
      throw new NotFoundException('doctor profile not found');
    }

    return doctorProfile.id;
  }

  async getAllException(
    userId: string,
    page: number,
    limit: number,
    type?: ExceptionType,
    from?: string,
    to?: string,
    search?: string,
  ) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policy.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('Availability Policy must exist');
    }

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        throw new BadRequestException('Invalid from date');
      }
    }
    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        throw new BadRequestException('Invalid from date');
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      throw new BadRequestException('from date must be less than or equal to date');
    }

    const where: Prisma.ExceptionWhereInput = {
      doctorId,

      ...(type && { type }),

      ...(search && {
        reason: {
          contains: search,
          mode: 'insensitive',
        },
      }),

      ...(fromDate || toDate
        ? {
            AND: [
              ...(fromDate ? [{ endTime: { gte: fromDate } }] : []),
              ...(toDate ? [{ startTime: { lte: toDate } }] : []),
            ],
          }
        : {}),
    };

    const data = await this.exceptionRepo.getAllExceptions(where, skip, limit);
    const count = await this.exceptionRepo.countException(where);

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

  async getOne(id: string, userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policy.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('Availability Policy must exist');
    }
    const exception = await this.exceptionRepo.getOneException(id, doctorId);
    if (!exception) {
      throw new NotFoundException('Exception not found');
    }

    return exception;
  }

  async createException(dto: CreateExceptionDto, userId: string) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const policy = await this.policy.getUniquePolicy(doctorId);
    if (!policy) {
      throw new NotFoundException('Availability Policy must exist');
    }
    const from = new Date(dto.startTime);
    const to = new Date(dto.endTime);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestException('Invalid Date');
    }
    if (from >= to) {
      throw new BadRequestException('end time must be greater than start time');
    }

    let normalizedStart = from;
    let normalizedEnd = to;

    if (dto.type === ExceptionType.DAY_OFF) {
      const dayStart = new Date(from);
      dayStart.setHours(0, 0, 0, 0);

      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);

      normalizedStart = dayStart;
      normalizedEnd = nextDay;
    }
    if (
      dto.type === ExceptionType.CUSTOM_AVAILABLE_HOURS ||
      dto.type === ExceptionType.CUSTOM_UNAVAILABLE_HOURS
    ) {
      if (
        from.getFullYear() !== to.getFullYear() ||
        from.getMonth() !== to.getMonth() ||
        from.getDate() !== to.getDate()
      ) {
        throw new BadRequestException('Custom available hours must be within the same day');
      }
    }
    const where: Prisma.ExceptionWhereInput = {
      doctorId,
      startTime: { lt: normalizedEnd },
      endTime: { gt: normalizedStart },
    };
    const exception = await this.exceptionRepo.getException(where);
    if (exception) {
      throw new BadRequestException('This exception overlaps with an existing one');
    }
    if (dto.type === ExceptionType.DAY_OFF || dto.type === ExceptionType.CUSTOM_UNAVAILABLE_HOURS) {
      const where: Prisma.AppointmentWhereInput = {
        doctorId,
        date: { lt: normalizedEnd, gt: normalizedStart },
      };
      const appointmentConflict = await this.appointmentRepo.getAppointment(where);
      if (appointmentConflict) {
        throw new BadRequestException('There are appointments during this time range');
      }
    }
    if(dto.type===ExceptionType.CUSTOM_AVAILABLE_HOURS){
      const now = new Date()
      const day = mpJsDayToWeek(now.getDay())
      const isOff = policy.weeklyOffDays.includes(day)
      if(!isOff){
        throw new BadRequestException("only day off can make it In")
      }
    }
    const exceptions = await this.exceptionRepo.createException({
      reason: dto.reason ?? undefined,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      type: dto.type,
      profileDoctor: { connect: { id: doctorId } },
    });

  if(dto.type!==ExceptionType.CUSTOM_AVAILABLE_HOURS){
    const appointments = await this.appointmentRepo.getAppointment(doctorId);
    const userIds = appointments.map((id) => id.profileParent.userId);
    let message =
      dto.type === ExceptionType.DAY_OFF
        ? 'Doctor in Exception Today'
        : `Doctor in exception from ${dto.startTime} to ${dto.endTime} `;
    await this.notification.createManyForUsers(userIds, {
      title: 'Doctor in Exception',
      type: NotificationType.DOCTOR_IN_EXCEPTION,
      message,
      senderId: exceptions.profileDoctor.userId,
    });
  }
  else {
    await this.notification.createForRole(Role.PARENT,{
      title: 'Doctor Available Today',
      message: `A doctor ${exceptions.profileDoctor.fullName} is available Today`,
      type: NotificationType.DOCTOR_DAY_IN,
      data: {
        doctorId,
      },
    })
  }
    return {
      exceptions,
    };
  }

  async updateException(dto: UpdateExcpetionDto, id: string, userId: string) {
    await this.getOne(id, userId);
    let from: Date | undefined = dto.startTime ? new Date(dto.startTime) : undefined;
    let to: Date | undefined = dto.endTime ? new Date(dto.endTime) : undefined;

    if (from && to) {
      if (isNaN(from.getTime()) || isNaN(to.getTime()))
        throw new BadRequestException('invalid Date');
    }
    if (!from || !to) {
      throw new BadRequestException('Start time and End time are require');
    }
    if (from > to) {
      throw new BadRequestException('end time must be greater than start time');
    }

    if (dto.type) {
      throw new BadRequestException("can't change the type");
    }

    const updatedExcetpion = await this.exceptionRepo.updateException(
      {
        reason: dto.reason,
        startTime: from,
        endTime: to,
      },
      id,
    );

    return updatedExcetpion;
  }
  async deleteException(id: string, userId: string) {
    await this.getOne(id, userId);
    return await this.exceptionRepo.deleteException(id);
  }

  async makeDayIn() {}
}
