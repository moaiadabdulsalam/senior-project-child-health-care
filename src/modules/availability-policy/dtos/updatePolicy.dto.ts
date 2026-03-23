import { PartialType } from '@nestjs/swagger';
import { CreatePolicyDto } from './createPolicy.dto';

export class UpdatePolicyDto extends PartialType(CreatePolicyDto) {}
