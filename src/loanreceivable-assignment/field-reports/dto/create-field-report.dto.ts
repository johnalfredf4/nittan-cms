import { IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateFieldReportDto {
  @IsNumber()
  loanAssignmentId: number;

  @IsString()
  remarks: string;

  @IsString()
  skipTraceResult: string; // POSITIVE | NEGATIVE | UNDETERMINED

  @IsBoolean()
  isSubjectForSkip: boolean;

  @IsNumber()
  createdByAgentId: number;
}
