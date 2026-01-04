import { CreateMonthlyIncomeDto } from './create-monthly-income.dto';

export class UpdateMonthlyIncomeDto {
  incomeType?: string;
  amount?: number;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
}

