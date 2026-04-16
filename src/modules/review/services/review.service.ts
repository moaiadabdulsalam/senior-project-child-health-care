import {
  ForbiddenException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from '../dtos/createReview.dto';
import { UpdateReviewDto } from '../dtos/updateReview.dto';
import { AuthRepository } from 'src/modules/auth/repositories/auth.repository';
import { AppointmentStatus, DoctorStatus, Prisma, Role } from '@prisma/client';
import { AppointmentReminder } from 'src/modules/appointment/jobs/reminderAppointment';
import { AppointmentRepository } from 'src/modules/appointment/repositories/appointment.repository';
import { ReviewRepository } from '../repositories/review.repositories.dto';
import { DoctorsParentRepository } from 'src/modules/doctors-parent/repositories/doctorsParent.repositories';
import { take } from 'rxjs';

@Injectable()
export class ReviewService {
  constructor(
    private readonly userRepo: AuthRepository,
    private readonly appointmentRepo: AppointmentRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly doctorParent: DoctorsParentRepository,
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
    if (!doctorProfile || doctorProfile.status !== DoctorStatus.CONFIRMING) {
      throw new NotFoundException('doctor profile not found');
    }

    return doctorProfile.id;
  }

  async getDoctorComments(doctorId: string, page: number, limit: number) {
    const doctor = await this.doctorParent.getOne(doctorId);
    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }
    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      doctorId,
      comment: {
        not: null,
      },
    };
    const [comments, total] = await Promise.all([
      this.reviewRepo.getAllComments(where, skip, limit),
      this.reviewRepo.countComments(where),
    ]);

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getMyComments(userId: string, page: number, limit: number) {
    const doctorId = await this.checkUserAndProfileDoctor(userId);
    const doctor = await this.doctorParent.getOne(doctorId);
    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }

    if (page < 1) {
      throw new BadRequestException('page must be greater than 0');
    }
    if (limit < 10) {
      throw new BadRequestException('limit must be grater than 9');
    }

    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      doctorId,
      comment: {
        not: null,
      },
    };
    const [comments, total] = await Promise.all([
      this.reviewRepo.getAllComments(where, skip, limit),
      this.reviewRepo.countComments(where),
    ]);

    return {
      data: comments,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createReview(dto: CreateReviewDto, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const appointment = await this.appointmentRepo.getOneAppointmentById(dto.appointmentId);
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Only completed appointments can be reviewed');
    }

    if (appointment.parentId !== parentId) {
      throw new ForbiddenException('Not your appointment');
    }

    const existing = await this.reviewRepo.getReviewByAppointment(appointment.id);
    if (existing) {
      throw new BadRequestException('Already reviewed');
    }
    const doctorId = appointment.doctorId;

    return this.reviewRepo.createReview(
      {
        appointmentId: appointment.id,
        parentId,
        doctorId,
        rating: dto.rating,
        comment: dto.comment ?? undefined,
      },
      doctorId,
    );
  }

  async updateReview(dto: UpdateReviewDto, userId: string, id: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const review = await this.reviewRepo.getReviewById(id);
    if (!review) {
      throw new NotFoundException('review not found');
    }
    if (review.parentId !== parentId) {
      throw new BadRequestException('this review not for you');
    }

    const doctorId = review.doctorId;

    return this.reviewRepo.updateReview(
      {
        rating: dto.rating ?? undefined,
        comment: dto.comment ?? undefined,
      },
      id,
      doctorId,
    );
  }

  async deleteReview(id: string, userId: string) {
    const parentId = await this.checkUserAndProfileParent(userId);
    const review = await this.reviewRepo.getReviewById(id);
    if (!review) {
      throw new NotFoundException('review not found');
    }
    if (review.parentId !== parentId) {
      throw new BadRequestException('this review not for you');
    }

    const doctorId = review.doctorId;
    return this.reviewRepo.deleteReview(id, doctorId);
  }
}
