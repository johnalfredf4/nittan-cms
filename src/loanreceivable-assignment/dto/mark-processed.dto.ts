import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { AccountClass } from '../entities/loan-assignment.entity';

export class BulkOverrideAssignmentDto {
  @IsInt()
  fromAgentId: number;

  @IsInt()
  toAgentId: number;

  @IsOptional()
  @IsEnum(AccountClass)
  accountClass?: AccountClass;
}
