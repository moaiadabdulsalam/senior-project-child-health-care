import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GameSessionRepository } from '../repositories/gameSession.repository';
import { FinishGameSessionDto } from '../dtos/finishGameSession.dto';
import { ChildRepository } from 'src/modules/child/repositories/child.repository';
import { GameRepository } from '../repositories/game.repository';
import { GameSessionStatus } from '@prisma/client';

@Injectable()
export class GameSessionService {
  constructor(
    private readonly gameSessionRepo: GameSessionRepository,
    private readonly gameRepo: GameRepository,
    private readonly childRepo: ChildRepository,
  ) {}

  async startGameSession(id: string, childId: string, sessionId: string) {
    const child = await this.childRepo.findById(childId);
    if (!child) {
      throw new NotFoundException('child not found');
    }

    const game = await this.gameRepo.getOne(id);
    if (!game) {
      throw new NotFoundException('game not found');
    }

    const activeSession = await this.gameSessionRepo.findActiveSessionByChildAndGame(
      childId,
      sessionId,
      id,
    );

    if (activeSession) {
      throw new BadRequestException('There is already an active session for this game');
    }

    const startedAt = new Date();
    const status = GameSessionStatus.IN_PROGRESS;

    const startGameSession = await this.gameSessionRepo.startGameSession({
      childId,
      childAccessSessionId: sessionId,
      gameId: id,
      startedAt,
      status,
    });

    return {
      startGameSession,
    };
  }

  async finishGameSession(
    id: string,
    childId: string,
    sessionId: string,
    dto: FinishGameSessionDto,
  ) {
    const child = await this.childRepo.findById(childId);
    if (!child) {
      throw new NotFoundException('child not found');
    }

    const gameSession = await this.gameSessionRepo.getOneGameSession(id);
    if (!gameSession) {
      throw new NotFoundException('gameSession not found');
    }
    if (gameSession.childId !== childId) {
      throw new BadRequestException('This game session does not belong to this child');
    }

    if (gameSession.childAccessSessionId !== sessionId) {
      throw new BadRequestException('This game session does not belong to this access session');
    }

    if (gameSession.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException('game session is not in progress');
    }

    const endedAt = new Date();
    const durationSeconds = Math.max(
      0,
      Math.floor((endedAt.getTime() - gameSession.startedAt.getTime()) / 1000),
    );

    const finishedGameSession = await this.gameSessionRepo.FinishGameSession(id, {
      endedAt: new Date(),
      durationSeconds,
      score: dto.score,
      levelReached: dto.levelReached,
      status: GameSessionStatus.COMPLETED,
    });

    return {
      finishedGameSession,
    };
  }
}
