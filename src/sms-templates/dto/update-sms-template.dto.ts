import { IsOptional } from 'class-validator';

export class UpdateSmsTemplateDto {
  @IsOptional()
  title?: string;

  @IsOptional()
  message?: string;

  @IsOptional()
  isActive?: boolean;
}
