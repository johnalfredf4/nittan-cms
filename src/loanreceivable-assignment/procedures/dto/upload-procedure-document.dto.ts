import { IsNumber, IsString } from 'class-validator';

export class UploadProcedureDocumentDto {
  @IsNumber()
  procedureId: number;

  @IsString()
  documentType: string;

  @IsString()
  documentName: string;

  @IsNumber()
  uploadedByAgentId: number;
}
