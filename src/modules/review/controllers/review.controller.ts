import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { CreateReviewDto } from '../dtos/createReview.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.PARENT)
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/comments')
  @Roles(Role.PARENT, Role.ADMIN)
  getMyComments(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const { userId } = req.user;
    return this.reviewService.getMyComments(userId, page, limit);
  }

  @Get('doctor/:doctorId/comments')
  @Roles(Role.PARENT, Role.ADMIN)
  getDoctorComments(
    @Param('doctorId') doctorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reviewService.getDoctorComments(doctorId, page, limit);
  }
  @Post()
  createReview(@Body() dto: CreateReviewDto, @Req() req) {
    const { userId } = req.user;
    return this.reviewService.createReview(dto, userId);
  }

  @Patch('/:id')
  updateReview(@Body() dto: CreateReviewDto, @Req() req, @Param('id') id: string) {
    const { userId } = req.user;
    return this.reviewService.updateReview(dto, userId, id);
  }

  @Delete('/:id')
  deleteReview(@Req() req, @Param('id') id: string) {
    const { userId } = req.user;
    return this.reviewService.deleteReview(id, userId);
  }
}
