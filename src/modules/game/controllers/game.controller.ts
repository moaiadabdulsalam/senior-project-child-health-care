import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { ChildAccessGuard } from 'src/modules/login-child/guard/loginChild.guard';
import { RoleGuard } from 'src/core/guard/role.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(ChildAccessGuard, RoleGuard, ThrottlerGuard)
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Roles(Role.CHILD)
  @Get()
  getAllGames() {
    return this.gameService.getAllGames();
  }

  @Roles(Role.CHILD)
  @Get('/:id')
  getOneGame(@Param('id') id: string) {
    return this.gameService.getOneGame(id);
  }
}
