import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllGames() {
    return this.prisma.game.findMany();
  }

  async getOne(id: string) {
    return this.prisma.game.findUnique({
      where: {
        id,
      },
    });
  }
}
