import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';

import {
  LoanReceivableAssignment,
  AccountClass,
} from './entities/loanreceivable-assignment.entity';

import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Injectable()
export class LoanreceivableAssignmentService {
  private readonly MAX_RECORDS_PER_AGENT = 10;
  private readonly logger = new Logger(LoanreceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    @InjectDataSource('nittan_app')
    private readonly appDataSource: DataSource,

    @InjectDataSource('nittan')
    private readonly coreDb: DataSource,
  ) {}

  /**
   * CRON: Runs every 5 minutes
   * 1. Remove expired assignments
   * 2. Assign new ones
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAssignmentsRotation() {
    this.logger.log('Starting CRON assignment rotation...');
    await this.expireOldAssignments();
    await this.assignNewLoans();
    this.logger.log('CRON assignment rotation finished.');
  }

  /**
   * Expire assignments when retention date is reached
   */
  private async expireOldAssignments() {
    await this.assignmentRepo.update(
      {
        processed: false,
        retentionUntil: LessThan(new Date()),
      },
      {
        processed: true,
        updatedAt: new Date(),
      },
    );
  }

  /**
   * Get loans ready for assignment from MSSQL
   */
  private async fetchUnassignedReceivables() {
    const query = `
      WITH Loans AS (
        SELECT TOP 300
          LoanApplicationID,
          DueDate,
          DATEDIFF(DAY, DueDate, GETDATE()) AS DPD,
          ROW_NUMBER() OVER (PARTITION BY LoanApplicationID ORDER BY DueDate ASC) AS rn
        FROM [Nittan].[dbo].[tblLoanReceivables]
        WHERE Cleared = 0
          AND DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT LoanApplicationID, DPD
      FROM Loans
      WHERE rn = 1;
    `;

    return await this.coreDb.query(query);
  }

  /**
   * Assign new loans to agents
   */
  private async assignNewLoans() {
    const receivables = await this.fetchUnassignedReceivables();
    if (!receivables || receivables.length === 0) return;

    const agents = await this.fetchAgentsWithCounts();
    if (!agents.length) return;

    for (const agent of agents) {
      const remainingSlots = this.MAX_RECORDS_PER_AGENT - agent.activeCount;
      if (remainingSlots <= 0) continue;

      const loansToAssign = receivables.splice(0, remainingSlots);

      const records = loansToAssign.map((rec) => {
        const { accountClass, retentionDays } =
          this.getAccountClassAndRetention(rec.DPD);

        const retentionUntil = new Date();
        retentionUntil.setDate(retentionUntil.getDate() + retentionDays);

        return this.assignmentRepo.create({
          loanReceivableId: rec.LoanApplicationID,
          agentId: agent.agentId,
          dpd: rec.DPD,
          accountClass,
          retentionDays,
          retentionUntil,
          processed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await this.assignmentRepo.save(records);
    }
  }

  /**
   * Returns count of active unprocessed assignments per agent
   */
  private async fetchAgentsWithCounts() {
    return await this.appDataSource.query(`
      SELECT 
        ua.EmployeeId AS agentId,
        COUNT(a.id) AS activeCount
      FROM dbo.User_Accounts ua
      LEFT JOIN LoanAssignments a
        ON a.agentId = ua.EmployeeId
        AND a.processed = 0
      WHERE ua.status = 1
      GROUP BY ua.EmployeeId
      ORDER BY agentId ASC;
    `);
  }

  /**
   * Categorize based on DPD
   */
  private getAccountClassAndRetention(dpd: number): {
    accountClass: AccountClass;
    retentionDays: number;
  } {
    if (dpd === 0) return { accountClass: AccountClass.CURRENT, retentionDays: 7 };
    if (dpd >= 1 && dpd <= 30) return { accountClass: AccountClass.AGING_1_30, retentionDays: 7 };
    if (dpd >= 31 && dpd <= 60) return { accountClass: AccountClass.AGING_31_60, retentionDays: 7 };
    if (dpd >= 61 && dpd <= 90) return { accountClass: AccountClass.AGING_61_90, retentionDays: 7 };
    if (dpd >= 91 && dpd <= 120) return { accountClass: AccountClass.AGING_91_120, retentionDays: 7 };
    if (dpd >= 121 && dpd <= 150) return { accountClass: AccountClass.AGING_121_150, retentionDays: 7 };
    if (dpd >= 151 && dpd <= 180) return { accountClass: AccountClass.AGING_151_180, retentionDays: 7 };

    return { accountClass: AccountClass.AGING_181_PLUS, retentionDays: 120 };
  }

  /**
   * Agent retrieves his work queue
   */
  async getQueueForAgent(agentId: number) {
    return await this.assignmentRepo.find({
      where: {
        agentId,
        processed: false,
      },
      order: {
        dpd: 'DESC',
      },
    });
  }

  /**
   * Agent processed a record and it becomes INACTIVE
   */
  async markAsProcessed(id: number) {
    await this.assignmentRepo.update(
      { id },
      { processed: true, updatedAt: new Date() },
    );
    return { success: true };
  }

  /**
   * Admin reassigns workloads
   */
  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const { fromAgentId, toAgentId, accountClass } = dto;

    const where: any = {
      agentId: fromAgentId,
      processed: false,
    };

    if (accountClass) where.accountClass = accountClass;

    const result = await this.assignmentRepo.update(where, {
      agentId: toAgentId,
      updatedAt: new Date(),
    });

    return { updated: result.affected ?? 0 };
  }
}
