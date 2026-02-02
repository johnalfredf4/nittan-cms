import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateFieldReportDto {
  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  skipTraceResult?: string;

  @IsOptional()
  @IsBoolean()
  isSubjectForSkip?: boolean;
}
