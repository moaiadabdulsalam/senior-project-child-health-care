import { IsOptional, IsString } from 'class-validator';

export class RejectConversationRequestDto {
  @IsOptional()
  @IsString()
  rejectedReason?: string;
}
