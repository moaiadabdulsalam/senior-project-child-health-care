import { IsOptional } from 'class-validator';


export class UpdateParentProfileDto {
  @IsOptional()
  fullName?: string;
  @IsOptional()
  fullNameArabic?: string;
  @IsOptional()
  address?:string
  @IsOptional()
  addressArabic?:string
  @IsOptional()
  phone? : string
}
