import { IsInt, IsEnum, IsOptional } from 'class-validator';
import { AccountClass } from '../types/account-class';

export class BulkOverrideAssignmentDto {
  @IsInt()
  fromAgentId: number;

  @IsInt()
  toAgentId: number;

  @IsOptional()
  @IsEnum(AccountClass)
  accountClass?: AccountClass;
}
