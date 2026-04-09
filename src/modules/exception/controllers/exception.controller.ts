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
import { ExceptionService } from '../services/exception.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { ExceptionType, Role } from '@prisma/client';
import { CreateExceptionDto } from '../dtos/createException.dto';
import { UpdateExcpetionDto } from '../dtos/updateException.dto';
import { Roles } from 'src/core/decorator/role.decorator';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.DOCTOR)
@Controller('exception')
export class ExceptionController {
  constructor(private readonly exceptionService: ExceptionService) {}
  @SkipThrottle()
  @Get()
  getAllException(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('type') type?: ExceptionType,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('search') search?: string,
  ) {
    const { userId } = req.user;
    return this.exceptionService.getAllException(userId, page, limit, type, from, to, search);
  }

  @SkipThrottle()
  @Get('/:id')
  getOne(@Req() req, @Param('id') id: string) {
    const { userId } = req.user;
    return this.exceptionService.getOne(id, userId);
  }

  @Post()
  createException(@Body() dto: CreateExceptionDto, @Req() req) {
    const { userId } = req.user;
    return this.exceptionService.createException(dto, userId);
  }

  @Patch('/:id')
  updateException(@Body() dto: UpdateExcpetionDto, @Param('id') id: string, @Req() req) {
    const { userId } = req.user;
    return this.exceptionService.updateException(dto, id, userId);
  }

  @Delete('/:id')
  deleteException(@Req() req, @Param('id') id: string) {
    const { userId } = req.user;
    return this.exceptionService.deleteException(id, userId);
  }

 
}
