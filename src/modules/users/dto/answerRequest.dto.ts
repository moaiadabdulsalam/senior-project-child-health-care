import { DoctorStatus } from "@prisma/client";
import { IsEnum } from "class-validator";


export class AnswerRequestDto{
    
    @IsEnum(DoctorStatus)
    status : DoctorStatus
    
}