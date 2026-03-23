import { PartialType } from '@nestjs/swagger';
import { CreateExceptionDto } from './createException.dto';

export class UpdateExcpetionDto extends PartialType(CreateExceptionDto) {}
