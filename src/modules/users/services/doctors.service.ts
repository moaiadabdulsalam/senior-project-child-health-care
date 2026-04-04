import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DoctorsRepository } from '../repositories/doctors.repository';
import { CreateDoctorDto } from '../dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { DoctorStatus, NotificationType, Role } from '@prisma/client';
import { UpdateActivityDto } from '../dto/updateActivity.dto';
import { AnswerRequestDto } from '../dto/answerRequest.dto';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { NotificationService } from 'src/modules/notification/services/notification.service';
@Injectable()
export class DoctorsService {
  constructor(
    private readonly doctorsRep: DoctorsRepository,
    private readonly authService: AuthService,
    private readonly notification: NotificationService,
  ) {}

  async getAllDoctors() {
    return await this.doctorsRep.getAllDoctors();
  }
  async getOne(id: string) {
    const doctor = await this.doctorsRep.getOne(id);
    if (!doctor) {
      throw new NotFoundException('doctor not found');
    }
    return doctor;
  }

  async createDoctor(dto: CreateDoctorDto) {
    const doctor = await this.doctorsRep.getOneByEmail(dto.email);
    if (doctor) {
      throw new BadRequestException('email is already exist');
    }

    const passwordHash: string = await bcrypt.hash(dto.password, 10);
    const data = { email: dto.email, passwordHash, role: Role.DOCTOR };
    return await this.doctorsRep.createUserDoctor(data);
  }
  async updateDoctorsActivity(id: string, dto: UpdateActivityDto) {
    const doctor = await this.getOne(id);

    await this.doctorsRep.updateDoctorsActivity(id, dto);

    const isActive = dto.isActive;

    const subject = isActive
      ? 'Your account has been reactivated'
      : 'Your account has been deactivated';

    const html = isActive
      ? `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>Hello Dr. ${doctor.profileDoctory?.fullName ?? ''}</h2>
          <p>Your account has been reactivated by the admin.</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; line-height: 1.8;">
          <h2>Hello Dr. ${doctor.profileDoctory?.fullName ?? ''}</h2>
          <p>Your account has been deactivated by the admin.</p>
        </div>
      `;

    try {
      await this.authService.sendToEmail(doctor.email, html, subject);
    } catch (error) {
      console.error('Failed to send doctor activity email:', error);
    }

    return {
      message: 'updated user successfully',
    };
  }

  async getRequestDoctor() {
    return this.doctorsRep.getRequestDoctor();
  }

  async answerRequeset(id: string, dto: AnswerRequestDto) {
    await this.getOne(id);
    const request = await this.doctorsRep.answerRequest(id, dto.status);
    let subject: string;
    let html: string;

    const doctorName = `Dr. ${request.profileDoctory?.fullName}`;
    const loginUrl = 'http://dada/login';

    if (dto.status === DoctorStatus.CONFIRMING) {
      subject = 'Your Account Has Been Approved ✔️';

      html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px;">
          
          <h2 style="color: #2e7d32;">🎉 Welcome ${doctorName}!</h2>
          
          <p style="font-size: 16px;">
            We are happy to inform you that your account has been 
            <strong style="color: green;">approved</strong>.
          </p>
    
          <p style="font-size: 16px;">
            You can now log in and start using the platform.
          </p>
    
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}"
               style="background-color: #2e7d32; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-size: 16px;">
               Login to Your Account
            </a>
          </div>
    
          <p style="font-size: 14px; color: #555;">
            If you face any issues, feel free to contact our support team.
          </p>
    
          <hr/>
    
          <p style="font-size: 13px; color: #888;">
            Best regards,<br/>
            Platform Team
          </p>
    
        </div>
      </div>
      `;
      await this.doctorsRep.updateDoctorsActivity(id, { isActive: true });
      await this.notification.createForRole(Role.ADMIN, {
        type: NotificationType.DOCTOR_VERIFIED,
        title: 'doctor register verified',
        message: `new Doctor ${doctorName} has joined to our system`,
        data: {
          doctorUserId: id,
        },
      });
    } else {
      subject = 'Your Registration Request Update';

      html = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 30px;">
        
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 12px;">
          
          <h2 style="color: #c62828;">Hello ${doctorName},</h2>
          
          <p style="font-size: 16px;">
            Thank you for your interest in joining our platform.
          </p>
    
          <p style="font-size: 16px;">
            Unfortunately, your registration request has been 
            <strong style="color: red;">rejected</strong>.
          </p>
    
          <p style="font-size: 16px;">
            Please review your information and try again.
          </p>
    
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}"
               style="background-color: #1976d2; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-size: 16px;">
               Go to Login Page
            </a>
          </div>
    
          <p style="font-size: 14px; color: #555;">
            If you believe this was a mistake, please contact support.
          </p>
    
          <hr/>
    
          <p style="font-size: 13px; color: #888;">
            Best regards,<br/>
            Platform Team
          </p>
    
        </div>
      </div>
      `;
    }

    await this.authService.sendToEmail(request.email, html, subject);
    await this.notification.createForRole(Role.ADMIN, {
      type: NotificationType.DOCTOR_REJECTED,
      title: 'doctor register rejected',
      message: `doctor register rejected`,
      data: {
        doctorUserId: id,
      },
    });
    return {
      message: `we ${dto.status} the request`,
    };
  }
}
