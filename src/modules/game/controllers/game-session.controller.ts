import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GameSessionService } from '../services/game-session.service';
import { StartGameSessionDto } from '../dtos/startGameSession.dto';
import { FinishGameSessionDto } from '../dtos/finishGameSession.dto';
import { RoleGuard } from 'src/core/guard/role.guard';
import { ChildAccessGuard } from 'src/modules/login-child/guard/loginChild.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@Controller('game-session')
@UseGuards(ChildAccessGuard,RoleGuard ,ThrottlerGuard)
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Roles(Role.CHILD)
  @Post('/start')
  startGameSession(@Body() dto : StartGameSessionDto) {
    return this.gameSessionService.startGameSession()
  }

  @Roles(Role.CHILD)
  @Post('/finish')
  finishGameSession(@Body() dto : FinishGameSessionDto) {
    return this.gameSessionService.finishGameSession()
  }
}
