import { IsInt, IsOptional } from 'class-validator';

export class UpdateRetentionDto {
  @IsOptional()
  accountClass?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsInt()
  retentionDays?: number; // ⬅️ changed

  @IsOptional()
  isActive?: boolean;
}
