import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  DataSource,
} from 'typeorm';
import {
  LoanReceivableAssignment,
  DpdCategory,
  AccountClass,
  AssignmentStatus
} from './entities/loanreceivable-assignment.entity';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    private readonly dataSource: DataSource, // direct SQL DB connection
  ) {}

  /**
   * Fetch receivables to assign.
   */
  private async loadReceivablesForAssignment(): Promise<any[]> {
    const sql = `
      WITH NextReceivables AS (
        SELECT TOP 200
            Id AS LoanReceivableId,
            LoanApplicationID,
            DueDate,
            DATEDIFF(DAY, DueDate, GETDATE()) AS DPD,
            ROW_NUMBER() OVER (
                PARTITION BY LoanApplicationID
                ORDER BY DueDate ASC
            ) AS rn
        FROM [Nittan].[dbo].[tblLoanReceivables]
        WHERE Cleared = 0
          AND DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
          AND DueDate > '2024-01-01'
      )
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `;

    const result = await this.dataSource.query(sql);
    console.log('📌 RECEIVABLES FETCHED:', result.length, 'records');
    return result;
  }

  /**
   * Query valid, active agents from system DB
   */
  @Cron('*/10 * * * * *') // every 10 seconds for testing
  private async loadAgents(): Promise<any[]> {
    const sql = `
      SELECT ua.EmployeeId AS agentId,
             ua.BranchId AS branchId,
             r.name AS roleName
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%'
    `;

    const result = await this.dataSource.query(sql);

    console.log('📌 RAW AGENTS FETCHED:', result.length);
    console.log(result);

    return result.map(a => ({
      agentId: a.agentId,
      branchId: a.branchId,
      assignedCount: 0,
    }));
  }

  private getRetentionDays(dpd: number): number {
    if (dpd >= 181) return 120;
    return 7;
  }

  private getDpdCategory(dpd: number): DpdCategory {
    if (dpd <= 0) return DpdCategory.DPD_0;
    if (dpd <= 30) return DpdCategory.DPD_1_30;
    if (dpd <= 60) return DpdCategory.DPD_31_60;
    if (dpd <= 90) return DpdCategory.DPD_61_90;
    if (dpd <= 120) return DpdCategory.DPD_91_120;
    if (dpd <= 150) return DpdCategory.DPD_121_150;
    if (dpd <= 180) return DpdCategory.DPD_151_180;
    return DpdCategory.DPD_181_PLUS;
  }

  /**
   * Main assignment process
   */
  async assignLoans(): Promise<void> {
    this.logger.log('Starting receivable assignment process...');

    await this.autoExpireAssignments();

    const loans = await this.loadReceivablesForAssignment();
    if (!loans.length) {
      this.logger.warn('No receivables found.');
      return;
    }

    let agents = await this.loadAgents();
    if (!agents.length) {
      this.logger.error('❌ No valid agents found in system!');
      return;
    }

    // attach count from current assignments
    const activeLoads = await this.getAgentLoad({});
    agents = agents.map(a => ({
      ...a,
      assignedCount: activeLoads.find(x => x.agentId === a.agentId)?.assignedCount ?? 0
    }));

    console.log('📌 INITIAL AGENT LOAD:', agents);

    for (const loan of loans) {
      agents = agents.sort((a, b) => a.assignedCount - b.assignedCount);
      const selectedAgent = agents[0];

      if (!selectedAgent) continue;
      if (selectedAgent.assignedCount >= 10) continue;

      const dpd = loan.DPD;
      const retentionDays = this.getRetentionDays(dpd);

      await this.assignmentRepo.save({
        loanReceivableId: loan.LoanReceivableId, // FIXED
        loanApplicationId: loan.LoanApplicationID, // FIXED
        dpd: loan.DPD,
        dpdCategory: this.getDpdCategory(dpd),
        agentId: selectedAgent.agentId,
        branchId: selectedAgent.branchId,
        locationType: selectedAgent.branchId === null ? 'HQ' : 'BRANCH',
        retentionDays,
        retentionUntil: new Date(Date.now() + retentionDays * 86400000),
        status: AssignmentStatus.ACTIVE,
      });

      selectedAgent.assignedCount++;
    }

    this.logger.log('✔ Loan receivable assignment completed.');
  }

  private async autoExpireAssignments(): Promise<void> {
    await this.assignmentRepo.update(
      {
        retentionUntil: LessThan(new Date()),
        status: AssignmentStatus.ACTIVE,
      },
      {
        status: AssignmentStatus.EXPIRED,
      },
    );
  }

  async getAgentLoad(query: { agentId?: number }) {
    const qb = this.assignmentRepo.createQueryBuilder('a');

    qb.select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'assignedCount')
      .where('a.status = :status', { status: AssignmentStatus.ACTIVE })
      .groupBy('a.agentId');

    if (query.agentId) qb.having('a.agentId = :agentId', { agentId: query.agentId });

    const result = await qb.getRawMany();

    return result.map(r => ({
      agentId: Number(r.agentId),
      assignedCount: Number(r.assignedCount),
    }));
  }

  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
  const { fromAgentId, toAgentId, accountClass } = dto;

  const whereCondition: any = {
    agentId: fromAgentId,
    status: AssignmentStatus.ACTIVE,
  };

  if (accountClass) {
    whereCondition.accountClass = accountClass;
  }

  const assignments = await this.assignmentRepo.find({
    where: whereCondition,
  });

  if (!assignments.length) {
    return {
      ok: true,
      message: 'No active assignments found for override',
    };
  }

  for (const record of assignments) {
    record.agentId = toAgentId;
    record.updatedAt = new Date();
  }

  await this.assignmentRepo.save(assignments);

  return {
    ok: true,
    message: `${assignments.length} records reassigned`,
  };
}

async markProcessed(assignmentId: number, agentId: number) {
  const assignment = await this.assignmentRepo.findOne({
    where: { id: assignmentId, agentId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  assignment.status = AssignmentStatus.PROCESSED;
  assignment.updatedAt = new Date();

  await this.assignmentRepo.save(assignment);

  return {
    ok: true,
    message: 'Assignment marked as processed',
  };
}

}



