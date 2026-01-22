import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRetentionRuleDto {
  @IsString()
  categoryCode: string;

  @IsInt()
  dpdMin: number;

  @IsInt()
  dpdMax: number;

  @IsInt()
  @Min(1)
  retentionDays: number;

  @IsString()
  label: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
