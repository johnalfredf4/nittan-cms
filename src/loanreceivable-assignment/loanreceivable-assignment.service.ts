import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  DataSource,
  In,
} from 'typeorm';
import { LoanReceivableAssignment, DpdCategory, AccountClass } from './entities/loanreceivable-assignment.entity';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';

@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    private readonly dataSource: DataSource, // main DB connection for receivables
  ) {}

  /**
   * Fetch receivables to assign.
   * Includes past due and near due (7 days ahead)
   */
  private async loadReceivablesForAssignment(): Promise<any[]> {
    const sql = `
      WITH NextReceivables AS (
          SELECT TOP 200 LoanApplicationId,
                 DueDate,
                 DATEDIFF(DAY, DueDate, GETDATE()) AS DPD,
                 ROW_NUMBER() OVER (
                     PARTITION BY LoanApplicationId
                     ORDER BY DueDate ASC
                 ) AS rn
          FROM [Nittan].[dbo].[tblLoanReceivables]
          WHERE Cleared = 0
            AND DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `;

    const rows = await this.dataSource.query(sql);
    return rows;
  }

  /**
   * Determine retention days based on DPD
   */
  private getRetentionDays(dpd: number): number {
    if (dpd >= 181) return 120;
    return 7;
  }

  /**
   * Determine dpd category enum
   */
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
   * Assign receivables to agents
   */
  async assignLoans(): Promise<void> {
    this.logger.log('Starting receivable assignment process...');

    // Step 1. Expire assignments exceeding retention
    await this.autoExpireAssignments();

    // Step 2. Load receivables from main DB
    const loans = await this.loadReceivablesForAssignment();
    if (!loans.length) {
      this.logger.warn('No receivables available.');
      return;
    }

    // Step 3. Load agents and current active counts
    const agents = await this.getAgentLoad({});
    if (!agents.length) {
      this.logger.warn('No agents found.');
      return;
    }

    // Step 4. Loop and assign loans fairly
    for (const loan of loans) {
      const dpd = loan.DPD;
      const dpdCat = this.getDpdCategory(dpd);
      const retentionDays = this.getRetentionDays(dpd);

      // find agent with the least active assignments
      const sortedAgents = [...agents].sort((a, b) => a.assignedCount - b.assignedCount);
      const selectedAgent = sortedAgents[0];
      if (!selectedAgent) continue;

      if (selectedAgent.assignedCount >= 10) continue; // skip agents at full load

      await this.assignmentRepo.save({
        agentId: selectedAgent.agentId,
        loanApplicationId: loan.LoanApplicationId,
        dpdCategory: dpdCat,
        retentionUntil: new Date(new Date().getTime() + retentionDays * 86400000),
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      selectedAgent.assignedCount++;
    }

    this.logger.log('Loan receivable assignment completed.');
  }

  /**
   * Release expired receivables
   */
  private async autoExpireAssignments(): Promise<void> {
    await this.assignmentRepo.update(
      {
        retentionUntil: LessThan(new Date()),
        status: 'ACTIVE',
      },
      {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    );
  }

  /**
   * Returns how many items each agent currently has
   */
  async getAgentLoad(query: { agentId?: number }) {
    const qb = this.assignmentRepo.createQueryBuilder('a');

    qb.select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'assignedCount')
      .where('a.status = :status', { status: 'ACTIVE' })
      .groupBy('a.agentId');

    if (query.agentId) {
      qb.having('a.agentId = :agentId', { agentId: query.agentId });
    }

    const result = await qb.getRawMany();

    return result.map((r) => ({
      agentId: Number(r.agentId),
      assignedCount: Number(r.assignedCount),
    }));
  }

  /**
   * Mark single loan as processed by agent
   */
  async markProcessed(assignmentId: number, agentId: number) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId, agentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = 'PROCESSED';
    assignment.updatedAt = new Date();

    await this.assignmentRepo.save(assignment);
  }

  /**
   * Bulk override moving processed loans from one agent to another
   */
  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const records = await this.assignmentRepo.find({
      where: {
        agentId: dto.fromAgentId,
        status: 'ACTIVE',
      },
    });

    for (const rec of records) {
      rec.agentId = dto.toAgentId;
      rec.updatedAt = new Date();
      await this.assignmentRepo.save(rec);
    }

    return {
      moved: records.length,
      from: dto.fromAgentId,
      to: dto.toAgentId,
    };
  }
}
