import { IsNumber } from 'class-validator';

export class ReassignLoanDto {
  @IsNumber()
  assignmentId: number;

  @IsNumber()
  toAgentId: number;
}
