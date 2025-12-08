import { IsUUID, IsInt } from 'class-validator';

export class OverrideAssignmentDto {
  assignmentId: number;
  newAgentId: number;
}
