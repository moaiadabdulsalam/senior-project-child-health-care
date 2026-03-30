import { PartialType } from "@nestjs/swagger";
import { CreateMedicationDto } from "./createMedication.dto";


export class UpdateMedicationDto extends PartialType(CreateMedicationDto){ }