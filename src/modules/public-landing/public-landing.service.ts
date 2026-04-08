import { Injectable } from '@nestjs/common';
import { DoctorStatus, Prisma, Role } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

const doctorPublicSelect = {
  id: true,
  email: true,
  profileDoctory: {
    select: {
      id: true,
      fullName: true,
      speciality: true,
      description: true,
    },
  },
} satisfies Prisma.UserSelect;

@Injectable()
export class PublicLandingService {
  constructor(private readonly prisma: PrismaService) {}

  private activeDoctorWhere(): Prisma.UserWhereInput {
    return {
      isActive: true,
      role: Role.DOCTOR,
      profileDoctory: {
        status: DoctorStatus.CONFIRMING,
      },
    };
  }

  async getLanding() {
    const where = this.activeDoctorWhere();

    const [doctorUsers, doctorCount, childCount, appointmentCount] =
      await Promise.all([
        this.prisma.user.findMany({
          where,
          select: doctorPublicSelect,
          take: 6,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
        this.prisma.child.count(),
        this.prisma.appointment.count(),
      ]);

    const doctors = doctorUsers
      .filter((u) => u.profileDoctory)
      .map((u) => ({
        id: u.profileDoctory!.id,
        userId: u.id,
        name: u.profileDoctory!.fullName,
        specialty: u.profileDoctory!.speciality,
        bio: u.profileDoctory!.description ?? undefined,
      }));

    return {
      doctors,
      stats: {
        doctorCount,
        childCount,
        appointmentCount,
      },
    };
  }
}
