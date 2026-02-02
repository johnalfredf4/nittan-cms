import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCreditInvestigationCoBorrowerDto {
  @IsNumber()
  creditInvestigationReportId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  confirmingOfficer?: string;
}
