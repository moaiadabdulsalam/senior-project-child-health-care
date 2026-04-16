import { Module } from '@nestjs/common';
import { GameService } from './services/game.service';
import { GameSessionService } from './services/game-session.service';
import { GameController } from './controllers/game.controller';
import { GameSessionController } from './controllers/game-session.controller';
import { GameRepository } from './repositories/game.repository';
import { GameSessionRepository } from './repositories/gameSession.repository';
import { LoginChildModule } from '../login-child/login-child.module';
import { AuthModule } from '../auth/auth.module';
import { ChildModule } from '../child/child.module';

@Module({
  imports : [AuthModule,LoginChildModule , ChildModule],
  providers: [GameService, GameSessionService, GameRepository, GameSessionRepository],
  controllers: [GameController, GameSessionController],
})
export class GameModule {}
