import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  DataSource,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';

import {
  LoanReceivableAssignment,
  DpdCategory,
  AssignmentStatus,
} from './entities/loanreceivable-assignment.entity';

import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';
import { OverrideSingleDto } from './dto/override-single.dto';
import { LoanAssignmentPersonalSnapshotService } from './snapshot/loanassignment-personal-snapshot.service';

@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    /* ===============================
       ASSIGNMENTS DB (nittan_app)
    =============================== */
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    /* ===============================
       SNAPSHOT SERVICE
    =============================== */
    private readonly snapshotService: LoanAssignmentPersonalSnapshotService,

    /* ===============================
       CORE / LEGACY DB (nittan)
    =============================== */
   
    private readonly dataSource: DataSource,
  ) {}

  /* ============================================================
     FETCH RECEIVABLES
  ============================================================ */
  private async loadReceivablesForAssignment(): Promise<any[]> {
    const sql = `
      WITH NextReceivables AS (
        SELECT TOP 200
          r.Id                AS LoanReceivableId,
          r.LoanApplicationID AS LoanApplicationID,
          la.BorrowerID       AS BorrowerID,
          r.DueDate,
          DATEDIFF(DAY, r.DueDate, GETDATE()) AS DPD,
          ROW_NUMBER() OVER (
            PARTITION BY r.LoanApplicationID
            ORDER BY r.DueDate ASC
          ) AS rn
        FROM [Nittan].[dbo].[tblLoanReceivables] r
        INNER JOIN [Nittan].[dbo].[tblLoanApplications] la
          ON la.Id = r.LoanApplicationID
        WHERE r.Cleared = 0
          AND r.DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `;

    const rows = await this.dataSource.query(sql);
    this.logger.log(`📌 Receivables fetched: ${rows.length}`);
    return rows;
  }

  /* ============================================================
     FETCH ACTIVE AGENTS
  ============================================================ */
  private async loadAgents(): Promise<any[]> {
    const sql = `
      SELECT
        ua.EmployeeId AS agentId,
        ua.BranchId   AS branchId
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%';
    `;

    const agents = await this.appDataSource.query(sql);
    this.logger.log(`📌 Agents fetched: ${agents.length}`);

    return agents.map(a => ({
      agentId: Number(a.agentId),
      branchId: a.branchId ?? null,
      assignedCount: 0,
    }));
  }

  /* ============================================================
     HELPERS
  ============================================================ */
  private getRetentionDays(dpd: number): number {
    return dpd >= 181 ? 120 : 7;
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

  /* ============================================================
     CRON JOB — EVERY 1 MINUTE
  ============================================================ */
  @Cron('0 */1 * * * *')
  async assignLoans(): Promise<void> {
    this.logger.log('🔄 Starting receivable assignment process');

    await this.autoExpireAssignments();

    const loans = await this.loadReceivablesForAssignment();
    if (!loans.length) return;

    let agents = await this.loadAgents();
    if (!agents.length) return;

    const loads = await this.getAgentLoad({});
    agents = agents.map(a => ({
      ...a,
      assignedCount:
        loads.find(l => l.agentId === a.agentId)?.assignedCount ?? 0,
    }));

    for (const loan of loans) {
      agents.sort((a, b) => a.assignedCount - b.assignedCount);
      const agent = agents[0];

      if (!agent || agent.assignedCount >= 10) continue;

      const retentionDays = this.getRetentionDays(loan.DPD);

      try {
        const assignment = await this.assignmentRepo.save({
          loanReceivableId: loan.LoanReceivableId,
          loanApplicationId: loan.LoanApplicationID,
          borrowerId: loan.BorrowerID,
          dpd: loan.DPD,
          dpdCategory: this.getDpdCategory(loan.DPD),
          agentId: agent.agentId,
          branchId: agent.branchId,
          locationType: agent.branchId ? 'BRANCH' : 'HQ',
          retentionDays,
          retentionUntil: new Date(Date.now() + retentionDays * 86400000),
          status: AssignmentStatus.ACTIVE,
        });

        await this.snapshotService.createSnapshot(
          assignment.id,
          assignment.borrowerId,
        );

        agent.assignedCount++;
      } catch (err) {
        this.logger.error('❌ Failed to assign receivable', err);
      }
    }

    this.logger.log('✅ Loan receivable assignment completed');
  }

  /* ============================================================
     AUTO EXPIRE ASSIGNMENTS
  ============================================================ */
  private async autoExpireAssignments(): Promise<void> {
    await this.assignmentRepo.update(
      {
        status: AssignmentStatus.ACTIVE,
        retentionUntil: LessThan(new Date()),
      },
      { status: AssignmentStatus.EXPIRED },
    );
  }

  /* ============================================================
     QUERY ASSIGNMENTS BY AGENT
  ============================================================ */
async findActiveAssignmentsByAgent(agentId: number) {
  return this.assignmentRepo.find({
    where: {
      agentId,
      status: AssignmentStatus.ACTIVE,
    },
    order: { dpd: 'DESC' },
  });
}


  /* ============================================================
     AGENT LOAD
  ============================================================ */
  async getAgentLoad(query: { agentId?: number }) {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'assignedCount')
      .where('a.status = :status', { status: AssignmentStatus.ACTIVE })
      .groupBy('a.agentId');

    if (query.agentId) {
      qb.having('a.agentId = :agentId', { agentId: query.agentId });
    }

    return (await qb.getRawMany()).map(r => ({
      agentId: Number(r.agentId),
      assignedCount: Number(r.assignedCount),
    }));
  }

  /* ============================================================
     MANUAL OVERRIDES
  ============================================================ */
  async overrideSingle(assignmentId: number, dto: OverrideSingleDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    assignment.agentId = dto.toAgentId;
    assignment.updatedAt = new Date();

    return this.assignmentRepo.save(assignment);
  }

  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const records = await this.assignmentRepo.find({
      where: {
        agentId: dto.fromAgentId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    for (const r of records) {
      r.agentId = dto.toAgentId;
      r.updatedAt = new Date();
    }

    await this.assignmentRepo.save(records);

    return {
      ok: true,
      reassigned: records.length,
    };
  }

  /* ============================================================
     MARK PROCESSED
  ============================================================ */
  async markProcessed(assignmentId: number, agentId: number) {
    const assignment = await this.assignmentRepo.findOne({
      where: {
        id: assignmentId,
        agentId,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    assignment.status = AssignmentStatus.PROCESSED;
    assignment.updatedAt = new Date();

    await this.assignmentRepo.save(assignment);

    return { ok: true };
  }
}



