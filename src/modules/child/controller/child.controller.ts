import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChildService } from '../services/child.service';
import { CreateChildDto } from '../dtos/createChild.dto';
import { UpdateChildDto } from '../dtos/updateChild.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.PARENT)
@Controller('child')
export class ChildController {
  constructor(private childService: ChildService) {}
  @SkipThrottle()
  @Get()
  getAllChild(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    const { userId } = req.user;
    return this.childService.getAll(userId, page, limit, search);
  }

  @SkipThrottle()
  @Get('/:id')
  getOneChild(@Param('id') id: string, @Req() req) {
    const { userId } = req.user;
    return this.childService.getById(id, userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  CreateChild(
    @Body() dto: CreateChildDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.childService.createChild(dto, userId, file);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('image'))
  updateChild(
    @Param('id') id: string,
    @Body() dto: UpdateChildDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [new MaxFileSizeValidator({ maxSize: 5000000 })],
      }),
    )
    file?: Express.Multer.File,
  ) {
    const { userId } = req.user;
    return this.childService.updateChild(dto, userId, id, file);
  }

  @Delete('/:id')
  deleteChild(@Param('id') id: string, @Req() req) {
    const { userId } = req.user;
    return this.childService.deleteChild(userId, id);
  }
}
