import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class PaymentHistoryService {
  constructor(
    @InjectConnection('nittan')
    private readonly nittanConnection: Connection,
  ) {}

  async getPaymentHistory(loanApplicationId: number) {
    const result = await this.nittanConnection.query(
      `
      SELECT [ID]
            ,[LoanApplicationId]
            ,[LineNo]
            ,[Date]
            ,[ModeOfPaymentId]
            ,[CurrencyId]
            ,[HistoricalRate]
            ,[Amount]
            ,[Discount]
            ,[RefNo]
            ,[CheckDate]
            ,[Deposited]
            ,[ValueDate]
            ,[ORNo]
            ,[Comments]
            ,[CollectionCharge]
            ,[PHPAmount]
            ,[PaymentTypeId]
            ,[Void]
            ,[BankId]
            ,[UnknownPaymentId]
            ,[EncodedById]
            ,[ApplicationFee]
            ,[NotarialFee]
            ,[VATCharge]
            ,[Overpayment]
            ,[OutputTax]
            ,[DateVoided]
            ,[ORNo2]
            ,[ARNo]
            ,[DateChecked]
            ,[PaymentNatureId]
            ,[Conforme]
            ,[AttorneyFee]
            ,[MonthYear]
            ,[VoidById]
            ,[VoidDate]
            ,[IsRecovery]
            ,[CheckNumber]
            ,[RefBankId]
            ,[JournalId]
            ,[DepositDate]
            ,[TellerID]
            ,[DepositTotal]
            ,[ImportNo]
            ,[IsPOS]
            ,[CreationDate]
            ,[ORBranchId]
            ,[VoidJournalId]
            ,[DocumentaryStampTax]
      FROM [Nittan].[dbo].[tblLoanPayments]
      WHERE [LoanApplicationId] = @0
      ORDER BY [LineNo] ASC
      `,
      [loanApplicationId],
    );

    return result; // Return list (can be empty)
  }
}
