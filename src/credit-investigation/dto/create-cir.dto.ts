import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateCreditInvestigationDto {
  @IsString()
  loanCode: string;

  @IsOptional() loanAmount?: number;
  @IsOptional() monthlyTerm?: number;
  @IsOptional() monthlyAmortization?: number;

  @IsOptional() reportStatus?: string;
  @IsOptional() ciRemarks?: string;

  @IsString()
  borrowerName: string;

  @IsOptional() borrowerContact?: string;
  @IsOptional() borrowerEmail?: string;
  @IsOptional() borrowerAgency?: string;
  @IsOptional() borrowerEmployer?: string;
  @IsOptional() borrowerEmploymentStatus?: string;
  @IsOptional() borrowerPosition?: string;
  @IsOptional() borrowerConfirmingOfficer?: string;

  @IsOptional() additionalCiRemarks?: string;
  @IsOptional() ocularReport?: string;

  @IsOptional() ciReportBy?: string;
  @IsOptional() ocularReportBy?: string;
  @IsOptional() checkedAndPreApprovedBy?: string;
  @IsOptional() approvedBy?: string;

  @IsOptional() ndiComputation?: string;

  @IsNumber()
  createdByUserId: number;

  @IsString()
  createdByRole: string; // BRANCH | HO
}
