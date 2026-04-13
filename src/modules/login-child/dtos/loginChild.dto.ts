import { Transform } from "class-transformer"
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator"


export class LoginChildDto{

    @IsString()
    @IsNotEmpty()
    loginHandle : string

    @IsString()
    @IsNotEmpty()
    childId : string

    @IsNotEmpty()
    @Min(5)
    @Max(180)
    @Transform(({value})=>Number(value))
    @IsInt()
    durationMinutes : number
    
}