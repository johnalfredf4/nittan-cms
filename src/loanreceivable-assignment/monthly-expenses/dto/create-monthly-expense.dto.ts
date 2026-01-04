export class CreateMonthlyExpenseDto {
  personalSnapshotId: number;
  expenseType: string;
  amount: number;

  creditor?: string;
  creditAmount?: number;
  outstandingBalance?: number;
}
