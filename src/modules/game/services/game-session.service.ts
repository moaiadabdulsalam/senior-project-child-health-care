import { Injectable } from '@nestjs/common';
import { GameSessionRepository } from '../repositories/gameSession.repository';

@Injectable()
export class GameSessionService {
    constructor(private readonly gameSessionRepo : GameSessionRepository){}

    async startGameSession(){}
    

    async finishGameSession(){}
}
