import { IsNumber, IsString } from 'class-validator';

export class UploadDocumentDto {
  @IsNumber()
  loanAssignmentId: number;

  @IsString()
  documentName: string;

  @IsString()
  documentType: string; // LOAN_AGREEMENT, DISCLOSURE, etc

  @IsNumber()
  uploadedByAgentId: number;
}
