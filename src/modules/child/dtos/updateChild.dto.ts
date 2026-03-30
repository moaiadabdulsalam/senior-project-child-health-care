import { PartialType } from "@nestjs/swagger";
import { CreateChildDto } from "./createChild.dto";


export class UpdateChildDto extends PartialType(CreateChildDto) {}