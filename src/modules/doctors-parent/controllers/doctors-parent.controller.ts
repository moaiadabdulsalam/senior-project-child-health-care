import { Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/core/guard/role.guard';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { DoctorsParentService } from '../services/doctors-parent.service';
import { Role } from '@prisma/client';
import { Roles } from 'src/core/decorator/role.decorator';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(Role.PARENT)
@Controller('doctors-parent')
export class DoctorsParentController {
  constructor(private readonly drParentService: DoctorsParentService) {}

  @Get()
  getAllDoctors(
    @Req() req,
    @Query('page' , new DefaultValuePipe(1) , ParseIntPipe) page : number,
    @Query('limit' , new DefaultValuePipe(10) , ParseIntPipe) limit : number,
    @Query('search') search?  : string , 
  ) {
    const {userId} = req.user
    return this.drParentService.getAllDoctors(userId , page , limit , search)
  }

  @Get('/:id')//userId always
  getOne(@Param('id') id : string , @Req() req) {
    const {userId} = req.user
    return this.drParentService.getOne(userId,id)
  }
}
