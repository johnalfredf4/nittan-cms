import { Injectable } from '@nestjs/common';
import { ConnectionPool } from 'mssql';

@Injectable()
export class AssignmentsService {
  constructor(private readonly db: ConnectionPool) {}

  async getByEmployee(employeeId: number) {
    const result = await this.db.request()
      .input('EmployeeID', employeeId)
      .query(`
        SELECT la.[loanApplicationId]
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
        INNER JOIN Nittan.dbo.tblLoanReceivables AS lr ON lr.ID=la.loanReceivableId
        INNER JOIN Nittan.dbo.tblLoanApplications AS l ON l.ID=la.loanApplicationId
        WHERE la.[agentId] = @EmployeeID
      `);

    return result.recordset;
  }
}
