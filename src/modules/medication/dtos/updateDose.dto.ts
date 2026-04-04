import { IsBoolean, IsDateString, IsOptional } from "class-validator"


export class UpdateMedicationDoseDto{

    @IsBoolean()
    @IsOptional()
    taken? : boolean = false 

    @IsBoolean()
    @IsOptional()
    reminderSent? : boolean = false

    @IsDateString()
    @IsOptional()
    scheduledAt? : string
}