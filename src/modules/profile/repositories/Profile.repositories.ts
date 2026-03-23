import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/database/prisma/prisma.service";


@Injectable()

export class ProfileRepository{
    constructor(private readonly prisma : PrismaService){}

    async updateDoctor(doctorId : string , data:Prisma.ProfileDoctorUpdateInput){
        return await this.prisma.profileDoctor.update({
            where:{id:doctorId},
            data
        })
    }

    async updateParent(doctorId : string , data:Prisma.ProfileParentUpdateInput){
        return await this.prisma.profileParent.update({
            where:{id:doctorId},
            data
        })
    }

    async changePassword(userId :string, newPassword : string){
        return await this.prisma.user.update({
            where:{id:userId},
            data:{
                passwordHash:newPassword
            }
        })
    }
}