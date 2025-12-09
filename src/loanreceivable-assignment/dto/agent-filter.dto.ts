import { IsOptional, IsInt } from 'class-validator';

export class AgentFilterDto {
  @IsOptional()
  @IsInt()
  agentId?: number;
}
