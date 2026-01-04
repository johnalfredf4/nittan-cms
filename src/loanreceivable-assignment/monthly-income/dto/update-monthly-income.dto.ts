import { CreateMonthlyIncomeDto } from './create-monthly-income.dto';

export class UpdateMonthlyIncomeDto {
  incomeType?: string;
  amount?: string;
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
}


