import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ParentsService } from '../services/parents.service';
import { JwtAuthGuard } from 'src/modules/auth/guard/jwt.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';
import { UpdateActivityDto } from '../dto/updateActivity.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(JwtAuthGuard, RoleGuard, ThrottlerGuard)
@Roles(Role.ADMIN)
@Controller('parents')
export class ParentController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get()
  getAllUserParent() {
    return this.parentsService.getAllUserParent();
  }

  @Get('/:id')///userId always
  getChildsForSpecficParent(@Param('id') id: string) {
    return this.parentsService.getChildsForSpecficParent(id);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Patch('/:id')
  updateParentActivity(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.parentsService.updateParentUserActivity(id, dto);
  }
}
