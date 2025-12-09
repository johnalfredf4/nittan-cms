import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import {
  LoanReceivableAssignment,
  AccountClass,
} from './entities/loanreceivable-assignment.entity';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment)
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    private readonly mainDs: DataSource,
  ) {}

  async markProcessed(id: number) {
    const assignment = await this.assignmentRepo.findOne({ where: { id } });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'PROCESSED';
    assignment.updatedAt = new Date();

    await this.assignmentRepo.save(assignment);
    return assignment;
  }

  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    return await this.assignmentRepo.update(
      {
        agentId: dto.fromAgentId,
        status: 'ACTIVE',
      },
      {
        agentId: dto.toAgentId,
        accountClass: dto.accountClass ?? AccountClass.STANDARD,
        updatedAt: new Date(),
      },
    );
  }

  async expireAssignments() {
    const expired = await this.assignmentRepo.find({
      where: {
        status: 'ACTIVE',
        retentionUntil: LessThan(new Date()),
      },
    });

    for (const assignment of expired) {
      assignment.status = 'EXPIRED';
      assignment.updatedAt = new Date();
      await this.assignmentRepo.save(assignment);
    }

    return expired.length;
  }

  async getReceivablesToAssign(maxCount: number) {
    const sql = `
      ;WITH Ordered AS (
        SELECT TOP (${maxCount})
            id AS LoanReceivableID,
            LoanApplicationID,
            DueDate,
            DATEDIFF(DAY, DueDate, GETDATE()) AS DPD,
            ROW_NUMBER() OVER (
                PARTITION BY LoanApplicationID
                ORDER BY DueDate ASC
            ) AS rn
        FROM dbo.tblLoanReceivables
        WHERE Cleared = 0
          AND DueDate <= DATEADD(DAY, 7, GETDATE())
      )
      SELECT LoanReceivableID, LoanApplicationID, DueDate,
          CASE 
            WHEN DPD <= 0 THEN '0DPD'
            WHEN DPD BETWEEN 1 AND 30 THEN '1_30DPD'
            WHEN DPD BETWEEN 31 AND 60 THEN '31_60DPD'
            WHEN DPD BETWEEN 61 AND 90 THEN '61_90DPD'
            WHEN DPD BETWEEN 91 AND 120 THEN '91_120DPD'
            WHEN DPD BETWEEN 121 AND 150 THEN '121_150DPD'
            WHEN DPD BETWEEN 151 AND 180 THEN '151_180DPD'
            ELSE '180PLUS'
          END AS DPDCategory,
          CASE 
            WHEN DPD >= 181 THEN DATEADD(DAY, 120, GETDATE())
            ELSE DATEADD(DAY, 7, GETDATE())
          END AS RetentionUntil
      FROM Ordered
      WHERE rn = 1;
    `;

    return await this.mainDs.query(sql);
  }

  async assignLoans(agentId: number, loans: any[]) {
    const rows = loans.map((loan) =>
      this.assignmentRepo.create({
        agentId,
        loanReceivableId: loan.LoanReceivableID,
        loanApplicationId: loan.LoanApplicationID,
        dpdCategory: loan.DPDCategory,
        retentionUntil: loan.RetentionUntil,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    await this.assignmentRepo.save(rows);

    this.logger.log(
      `Assigned ${rows.length} receivables to agent ${agentId}`,
    );

    return rows;
  }
}
