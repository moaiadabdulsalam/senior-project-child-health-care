import { Injectable } from '@nestjs/common';
import { GameSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class GameSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async startGameSession(data: Prisma.GameSessionUncheckedCreateInput) {
    return this.prisma.gameSession.create({
      data,
    });
  }

  async getOneGameSession(id: string) {
    return this.prisma.gameSession.findUnique({
      where: {
        id,
      },
    });
  }

  async FinishGameSession(id : string,data : Prisma.GameSessionUncheckedUpdateInput ){
    return this.prisma.gameSession.update({
      where : {
        id
      },
      data
    })
  }

  async findActiveSessionByChildAndGame(childId : string , sessionId : string , gameId: string){
    return this.prisma.gameSession.findFirst({
      where : {
        childId,
        childAccessSessionId : sessionId,
        gameId,
        status : GameSessionStatus.IN_PROGRESS
      }
    })
  }
}
