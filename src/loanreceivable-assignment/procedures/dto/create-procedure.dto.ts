import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProcedureDto {
  @IsNumber()
  loanAssignmentId: number;

  @IsOptional() complaintAffidavitDate?: Date;
  @IsOptional() subscriptionDate?: Date;
  @IsOptional() mediationStatus?: string;

  @IsOptional() docketPaymentDate?: Date;
  @IsOptional() docketPaymentAmount?: number;

  @IsOptional() hearingSchedule?: Date;
  @IsOptional() caseStatus?: string;
  @IsOptional() activeCaseStatus?: string;

  @IsNumber()
  createdByAgentId: number;
}
