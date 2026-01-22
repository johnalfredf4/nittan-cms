import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAgentWorkloadDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  agentId?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minDpd?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxDpd?: number;
}
