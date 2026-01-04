import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMonthlyIncomeDto {
  personalSnapshotId: number;
  incomeType: string;
  amount: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
}



