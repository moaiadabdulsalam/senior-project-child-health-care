import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getReviewByAppointment(appointmentId: string) {
    return this.prisma.review.findUnique({
      where: {
        appointmentId,
      },
    });
  }
  async getReviewById(id: string) {
    return this.prisma.review.findUnique({
      where: {
        id,
      },
    });
  }

  async createReview(data: Prisma.ReviewUncheckedCreateInput, doctorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data,
      });
      const stats = await tx.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await tx.profileDoctor.update({
        where: {
          id: doctorId,
        },
        data: {
          reviewCount: stats._count.rating,
          averageRating: stats._avg.rating ?? 0,
        },
      });
      return { review };
    });
  }

  async updateReview(data: Prisma.ReviewUncheckedUpdateInput, id: string, doctorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const newReview = await tx.review.update({
        where: {
          id,
        },
        data,
      });
      const stats = await tx.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      const newProfileUpdated = await tx.profileDoctor.update({
        where: {
          id: doctorId,
        },
        data: {
          reviewCount: stats._count.rating,
          averageRating: stats._avg.rating ?? 0,
        },
      });
      return { newReview, newProfileUpdated };
    });
  }

  async deleteReview(id: string, doctorId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: {
          id,
        },
      });
      const stats = await tx.review.aggregate({
        where: { doctorId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      const newProfileDeleted = await tx.profileDoctor.update({
        where: {
          id: doctorId,
        },
        data: {
          reviewCount: stats._count.rating,
          averageRating: stats._avg.rating ?? 0,
        },
      });
      return { newProfileDeleted };
    });
  }

  async getAllComments(where: Prisma.ReviewWhereInput, skip: number, limit: number) {
    return this.prisma.review.findMany({
      where,
      select: {
        id: true,
        comment: true,
        createdAt: true,
        parent: {
          select: {
            id: true,
            fullName: true,
            fullNameArabic: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
  }

  async countComments(where: Prisma.ReviewWhereInput) {
    return this.prisma.review.count({
      where,
    });
  }
}
