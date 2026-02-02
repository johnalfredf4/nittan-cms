import { IsOptional } from 'class-validator';

export class UpdateCreditInvestigationDto {
  @IsOptional() loanAmount?: number;
  @IsOptional() monthlyTerm?: number;
  @IsOptional() monthlyAmortization?: number;
  @IsOptional() reportStatus?: string;
  @IsOptional() ciRemarks?: string;

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
}
