import { Body, Controller, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { GameSessionService } from '../services/game-session.service';
import { FinishGameSessionDto } from '../dtos/finishGameSession.dto';
import { RoleGuard } from 'src/core/guard/role.guard';
import { ChildAccessGuard } from 'src/modules/login-child/guard/loginChild.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Roles } from 'src/core/decorator/role.decorator';
import { Role } from '@prisma/client';

@UseGuards(ChildAccessGuard, RoleGuard, ThrottlerGuard)
@Controller('game-session')
export class GameSessionController {
  constructor(private readonly gameSessionService: GameSessionService) {}

  @Roles(Role.CHILD)
  @Post('/:id/start')
  startGameSession( @Param('id') id: string, @Req() req) {
    const { childId, sessionId } = req.user;
    return this.gameSessionService.startGameSession(id, childId, sessionId);
  }

  @Roles(Role.CHILD)
  @Patch('/:id/finish')
  finishGameSession(@Body() dto: FinishGameSessionDto, @Param('id') id: string, @Req() req) {
    const { childId, sessionId } = req.user;
    return this.gameSessionService.finishGameSession(id, childId, sessionId, dto);
  }
}
