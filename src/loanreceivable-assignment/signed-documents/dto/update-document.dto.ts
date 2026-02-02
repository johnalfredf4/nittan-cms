import { IsOptional, IsString } from 'class-validator';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  documentName?: string;

  @IsOptional()
  @IsString()
  status?: string; // SIGNED | PENDING
}
