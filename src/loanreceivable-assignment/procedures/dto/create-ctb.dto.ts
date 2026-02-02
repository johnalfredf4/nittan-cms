import { IsNumber, IsString } from 'class-validator';

export class CreateCTBDto {
  @IsNumber()
  procedureId: number;

  @IsString()
  checkNumber: string;

  @IsString()
  checkDate: string;

  @IsString()
  bankBranch: string;

  @IsNumber()
  amount: number;
}
