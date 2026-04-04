import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './createAppointment.dto';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
