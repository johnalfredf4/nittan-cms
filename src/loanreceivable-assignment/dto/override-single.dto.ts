import { IsInt } from 'class-validator';

export class OverrideSingleDto {
  @IsInt()
  toAgentId: number;
}
