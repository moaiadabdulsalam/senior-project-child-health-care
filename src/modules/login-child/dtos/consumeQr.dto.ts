import { IsNotEmpty, IsString } from "class-validator";

export class ConsumeQrDto {
    @IsString()
    @IsNotEmpty()
    token: string;
  }