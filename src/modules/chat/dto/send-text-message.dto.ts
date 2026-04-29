import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SendTextMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @MinLength(1)
  text: string;
}