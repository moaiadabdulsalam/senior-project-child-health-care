import { Injectable } from '@nestjs/common';
import { Child, MedicationStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class ParentStatisticalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getPhoto(childId: string){
    return await this.prisma.child.findFirst({
      where: {
        id:childId
      },
      select: {
        id: true,
        photo: true,
        birthDate:true
      },
    });
  }

  async getGames (childId: string , start : Date  ,end : Date){
    return await this.prisma.gameSession.findMany({
        where:{
            childId,
            startedAt:{
                gte:start
            },
            endedAt:{
                lte:end
            }
        },

    })
  }
  async allChildsForSpecficParent(parentId : string){
    return await this.prisma.child.findMany({
        where:{
            parentId
        },
        select:{
            id:true
        }
    })
  }

  async getMedications(childId : string){
    return await this.prisma.medication.findMany({
      where:{
        id:childId,
        status:MedicationStatus.ACTIVE
      }
    })
  }
 
}
