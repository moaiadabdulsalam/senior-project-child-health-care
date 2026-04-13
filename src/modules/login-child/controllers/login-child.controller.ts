import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SameDeviceService } from '../services/same-device.service';
import { QrDeviceService } from '../services/qr-device.service';
import { LoginChildDto } from '../dtos/loginChild.dto';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { AccessSessionStatus, Role } from '@prisma/client';
import { LoginChildService } from '../services/login-child.service';
import { ExtendChildSessionDto } from '../dtos/extendSession.dto';
import { ConsumeQrDto } from '../dtos/consumeQr.dto';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Controller('login-child')
export class LoginChildController {
  constructor(
    private readonly sameDeviceService: SameDeviceService,
    private readonly QrDeviceService: QrDeviceService,
    private readonly loginChildService: LoginChildService,
  ) {}

  @Roles(Role.PARENT)
  @Post('/sameDevice')
  sameDeviceLogin(@Body() dto: LoginChildDto, @Req() req) {
    const { userId } = req.user;
    return this.sameDeviceService.sameDeviceLogin(dto, userId);
  }

  @Roles(Role.PARENT)
  @Post('/qrDevice')
  QrDevice(@Body() dto :LoginChildDto , @Req() req)  {
    const { userId } = req.user;
    return this.QrDeviceService.createQr(dto, userId);
  }
  @Roles(Role.PARENT)
  @Post('/consumeQr')
  consumeQr(@Body() dto :ConsumeQrDto)  {
    return this.QrDeviceService.QrConsume(dto);
  }


  @Roles(Role.PARENT)
  @Patch('/:id/end')
  endSession(@Param('id') id: string, @Req() req) {
    const { userId } = req.user;
    return this.loginChildService.endSession(id, userId);
  }

  @Roles(Role.PARENT)
  @Patch('/:id/extend')
  extendSession(@Param('id') id: string, @Body() dto: ExtendChildSessionDto, @Req() req) {
    const { userId } = req.user;
    return this.loginChildService.extendChildSession(id, dto, userId);
  }


  @Roles(Role.PARENT)
  @Get('/activeSession')
  getAllSession(
    @Req() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: AccessSessionStatus,
    @Query('childId') childId?: string,
  ) {
    const { userId } = req.user;
    return this.loginChildService.getAllSessionForSpecficParent(
      userId,
      page,
      limit,
      status,
      childId,
    );
  }


  
}
