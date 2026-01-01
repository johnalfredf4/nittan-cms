import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectConnection('nittan_app')
    private readonly reportingConnection: Connection,
  ) {}

  async getByEmployee(employeeId: number) {
    const result = await this.reportingConnection.query(
      `
        SELECT p.*
              ,la.[id] AS AssignmentID
              ,la.[loanApplicationId]
              ,la.[loanReceivableId]
              ,la.[agentId]
              ,la.[branchId]
              ,lr.DueDate
              ,lr.Balance
              ,l.*
        FROM [Nittan-App].[dbo].[LoanReceivable_Assignments] AS la
        INNER JOIN Nittan.dbo.tblLoanReceivables AS lr ON lr.ID=la.loanReceivableId
        INNER JOIN Nittan.dbo.tblLoanApplications AS l ON l.ID=la.loanApplicationId
        INNER JOIN Nittan.dbo.tblPersonalInfos AS p ON p.ID=l.BorrowerId
        WHERE la.[agentId] = @0
      `,
      [employeeId],
    );

    return result;
  }

  async getByLoanReceivableId(loanReceivableId: number) {
  const result = await this.reportingConnection.query(
    `
      SELECT p.*
            ,la.[id] AS AssignmentID
            ,la.[loanApplicationId]
            ,la.[loanReceivableId]
            ,la.[agentId]
            ,la.[branchId]
            ,la.[locationType]
            ,la.[dpd]
            ,la.[dpdCategory]
            ,la.[retentionDays]
            ,la.[retentionUntil]
            ,la.[status]
            ,la.[createdAt]
            ,la.[updatedAt]
            ,lr.DueDate
            ,lr.Balance
            ,l.*
      FROM [Nittan-App].[dbo].[LoanReceivable_Assignments] AS la
      INNER JOIN Nittan.dbo.tblLoanReceivables AS lr ON lr.ID = la.loanReceivableId
      INNER JOIN Nittan.dbo.tblLoanApplications AS l ON l.ID = la.loanApplicationId
      INNER JOIN Nittan.dbo.tblPersonalInfos AS p ON p.ID=l.BorrowerId
      WHERE la.[loanReceivableId] = @0
    `,
    [loanReceivableId],
  );

  return result;
}

}
