import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, Repository } from 'typeorm';
import {
  LoanReceivableAssignment,
  AccountClass,
} from './entities/loanreceivable-assignment.entity';
import { AgentFilterDto } from './dto/agent-filter.dto';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment)
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    private readonly mainDs: DataSource, // MAIN DATABASE FOR USERS + LOANS
  ) {}

  /**
   * 🟦 Get active load of agents with filters
   * Filters:
   *   - location = HQ | BRANCH
   *   - branchId
   *   - roleName
   */
  async getAgentLoad(filters: AgentFilterDto) {
    this.logger.log(
      `Fetching agent load with filters: ${JSON.stringify(filters)}`,
    );

    let filterSql = `WHERE ua.status = 1`;
    let params: any[] = [];

    if (filters.location === 'HQ') {
      filterSql += ` AND ua.BranchId IS NULL`;
    }

    if (filters.location === 'BRANCH') {
      filterSql += ` AND ua.BranchId IS NOT NULL`;
    }

    if (filters.branchId) {
      filterSql += ` AND ua.BranchId = @0`;
      params.push(filters.branchId);
    }

    if (filters.roleName) {
      filterSql += ` AND r.name = @1`;
      params.push(filters.roleName);
    }

    const sql = `
      SELECT 
          ua.EmployeeId AS agentId,
          ISNULL(COUNT(lra.id), 0) AS activeCount
      FROM dbo.User_Accounts ua
      LEFT JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      LEFT JOIN dbo.Roles r ON r.id = ur.role_id
      LEFT JOIN dbo.LoanReceivable_Assignments lra
          ON lra.agentId = ua.EmployeeId
          AND lra.status = 'ACTIVE'
      ${filterSql}
      GROUP BY ua.EmployeeId
      ORDER BY agentId ASC;
    `;

    return await this.mainDs.query(sql, params);
  }

  /**
   * 🟩 Mark a receivable as processed (manually or via UI)
   */
  async markProcessed(id: number) {
    const assignment = await this.assignmentRepo.findOne({ where: { id } });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    assignment.status = 'PROCESSED';
    assignment.updatedAt = new Date();
    await this.assignmentRepo.save(assignment);

    this.logger.log(`Assignment ID=${id} marked PROCESSED`);
    return assignment;
  }

  /**
   * 🟧 Automatically expire assignments
   * logic: retentionUntil < now
   */
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

    this.logger.log(`Expired records: ${expired.length}`);
    return expired.length;
  }

  /**
   * 🟥 Bulk override from 1 agent → another
   */
  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const update: any = {
      agentId: dto.toAgentId,
      updatedAt: new Date(),
    };

    if (dto.accountClass) {
      update.accountClass = dto.accountClass;
    }

    const updated = await this.assignmentRepo.update(
      {
        agentId: dto.fromAgentId,
        status: 'ACTIVE',
      },
      update,
    );

    this.logger.warn(
      `Agent override: FROM=${dto.fromAgentId} TO=${dto.toAgentId} COUNT=${updated.affected}`,
    );

    return updated;
  }

  /**
   * 🟦 Get receivables for assignment
   * Filters:
   *    only assign new accounts
   */
  async getReceivablesToAssign(maxCount: number) {
    const sql = `
      ;WITH Ordered AS (
        SELECT TOP (${maxCount})
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
      SELECT LoanApplicationID, DueDate,
          CASE 
            WHEN DPD <= 0 THEN 'PENDING'
            WHEN DPD BETWEEN 1 AND 30 THEN 'A-REVIEW'
            WHEN DPD BETWEEN 31 AND 60 THEN 'EARLY'
            WHEN DPD BETWEEN 61 AND 120 THEN 'MID'
            WHEN DPD BETWEEN 121 AND 180 THEN 'LATE'
            ELSE 'AGING'
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

  /**
   * 🟨 Assign record to agent
   */
  async assignLoans(agentId: number, loans: any[]) {
    const rows = loans.map((loan) =>
      this.assignmentRepo.create({
        agentId,
        loanApplicationId: loan.LoanApplicationID,
        dpdCategory: loan.DPDCategory,
        retentionUntil: loan.RetentionUntil,
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    );

    await this.assignmentRepo.save(rows);

    this.logger.log(`Assigned ${rows.length} loans to agent ${agentId}`);

    return rows;
  }
}
