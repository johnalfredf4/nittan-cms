import { IsOptional } from 'class-validator';

export class UpdateProcedureDto {
  @IsOptional() complaintAffidavitDate?: Date;
  @IsOptional() subscriptionDate?: Date;
  @IsOptional() mediationStatus?: string;

  @IsOptional() docketPaymentDate?: Date;
  @IsOptional() docketPaymentAmount?: number;

  @IsOptional() hearingSchedule?: Date;
  @IsOptional() caseStatus?: string;
  @IsOptional() activeCaseStatus?: string;
}
