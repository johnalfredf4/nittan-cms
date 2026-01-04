export class UpdateMonthlyExpenseDto {
  expenseType?: string;
  amount?: number;

  creditor?: string;
  creditAmount?: number;
  outstandingBalance?: number;
}
