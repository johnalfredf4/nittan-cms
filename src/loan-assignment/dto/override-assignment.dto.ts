import { IsUUID, IsInt } from 'class-validator';

export class OverrideAssignmentDto {
  @IsUUID()
  assignmentId: string;

  @IsInt()
  newAgentId: number;
}
