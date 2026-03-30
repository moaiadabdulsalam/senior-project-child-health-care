import { IsDateString, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAppointmentDto {

    @IsString()
    @IsNotEmpty()
    doctorId : string   

    @IsString()
    @IsNotEmpty()
    childId : string

    @IsDateString()
    date : string

    @IsOptional()
    notes? : Record<any , string>

    @IsString()
    reason:string
}
