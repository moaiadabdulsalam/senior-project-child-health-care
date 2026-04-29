import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateConversationRequestDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsString()
  @MinLength(2)
  initialMessage: string;
}