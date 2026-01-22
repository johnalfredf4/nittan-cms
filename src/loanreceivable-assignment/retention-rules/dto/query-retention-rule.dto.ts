import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class QueryRetentionRuleDto {
  @IsOptional()
  @IsString()
  categoryCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
