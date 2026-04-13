import { Injectable, NotFoundException } from '@nestjs/common';
import { GameRepository } from '../repositories/game.repository';

@Injectable()
export class GameService {
  constructor(private readonly gameRepo: GameRepository) {}

  async getAllGames() {
    return this.gameRepo.getAllGames()
  }

  async getOneGame(id: string) {

    const game = await this.gameRepo.getOne(id)
    if(!game){
        throw new NotFoundException("game not found")
    }
    return game
  }
}
