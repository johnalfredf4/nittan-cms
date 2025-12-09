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

    return await this.dataSource.query(sql);
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
   * Assign receivables to agents evenly
   */
  async assignLoans(): Promise<void> {
    this.logger.log('Starting receivable assignment process...');

    await this.autoExpireAssignments();

    const loans = await this.loadReceivablesForAssignment();
    if (!loans.length) {
      this.logger.warn('No receivables available.');
      return;
    }

    let agents = await this.getAgentLoad({});
    if (!agents.length) {
      this.logger.warn('No agents found.');
      return;
    }

    for (const loan of loans) {
      // Refresh load each time to ensure fairness
      agents = await this.getAgentLoad({});

      const sortedAgents = [...agents].sort((a, b) => a.assignedCount - b.assignedCount);
      const selectedAgent = sortedAgents[0];

      if (!selectedAgent) continue;
      if (selectedAgent.assignedCount >= 10) continue;

      const dpd = loan.DPD;
      const dpdCat = this.getDpdCategory(dpd);
      const retentionDays = this.getRetentionDays(dpd);

      await this.assignmentRepo.save({
        loanReceivableId: loan.Id, // must match query
        loanApplicationId: loan.LoanApplicationId,
        dpd: loan.DPD,
        dpdCategory: dpdCat,
        agentId: selectedAgent.agentId,
        branchId: selectedAgent.branchId,
        locationType: selectedAgent.branchId === null ? 'HQ' : 'BRANCH',
        retentionDays: retentionDays,
        retentionUntil: new Date(Date.now() + retentionDays * 86400000),
        status: AssignmentStatus.ACTIVE,
      });



      selectedAgent.assignedCount++;
    }

    this.logger.log('Loan receivable assignment completed.');
  }

  /**
   * Release expired assignments
   */
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

  /**
   * Returns how many items each agent currently has
   */
  /**
 * Returns how many items each agent currently has
 */
async getAgentLoad(query: { agentId?: number }) {
  const qb = this.assignmentRepo.createQueryBuilder('a');

  qb.select('a.agentId', 'agentId')
    .addSelect('a.branchId', 'branchId')
    .addSelect('COUNT(*)', 'assignedCount')
    .where('a.status = :status', { status: 'ACTIVE' })
    .groupBy('a.agentId')
    .addGroupBy('a.branchId');

  if (query.agentId) {
    qb.having('a.agentId = :agentId', { agentId: query.agentId });
  }

  const result = await qb.getRawMany();

  // 👇 Put it here
  return result.map((r) => ({
    agentId: Number(r.agentId),
    branchId: Number(r.branchId),
    assignedCount: Number(r.assignedCount),
  }));
}


  /**
   * Mark single loan as processed
   */
  async markProcessed(assignmentId: number, agentId: number) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId, agentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = AssignmentStatus.PROCESSED;
    assignment.updatedAt = new Date();

    await this.assignmentRepo.save(assignment);
  }

  /**
   * Move ALL active loans from one agent to another
   */
  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const records = await this.assignmentRepo.find({
      where: {
        agentId: dto.fromAgentId,
        status: AssignmentStatus.ACTIVE,
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





