import { BadRequestException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { AppointmentRepository } from '../repositories/appointment.repository';
import { CreateAppointmentDto } from '../dtos/createAppointment.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AppointmentStatus, DoctorStatus, Prisma, Role } from '@prisma/client';
import { UpdateAppointmentDto } from '../dtos/updateAppointment.dto';
import { stat } from 'fs';
import { CancelAppointmentDto } from '../dtos/cancelAppointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly AppointmentRepo: AppointmentRepository,
    private userRepo: AuthRepository,
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
    await this.getOne(id);
    const appointment = await this.AppointmentRepo.updateAppointment(
      {
        childId: dto.childId ?? undefined,
        reason: dto.reason ?? undefined,
        notes: dto.notes ?? undefined,
        date: dto.date ?? undefined,
      },
      id,
    );

    return appointment;
  }
  async deleteAppointment(id: string) {
    const appointment = await this.getOne(id);
    const deletedAppointment = await this.AppointmentRepo.deleteAppointment(id);
    if (appointment.status === AppointmentStatus.CONFIRMED) {
      ////refund
    }
    return {
      deletedAppointment,
      message: 'appointment deleted successfuly',
    };
  }
  async cancelAppointment(id: string, dto: CancelAppointmentDto) {
    await this.getOne(id);
    await this.AppointmentRepo.updateAppointment(
      {
        status: AppointmentStatus.CANCELLED,
      },
      id,
    );

    //send notification to the client
  }
}
