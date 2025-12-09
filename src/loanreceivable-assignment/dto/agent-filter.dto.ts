import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator';

export class AgentFilterDto {
  @IsOptional()
  @IsNumber()
  branchId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['HQ', 'BRANCH'])
  location?: 'HQ' | 'BRANCH';

  @IsOptional()
  @IsString()
  roleName?: string;
}
