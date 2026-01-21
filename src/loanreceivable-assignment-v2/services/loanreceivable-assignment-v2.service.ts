import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  DataSource,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';

import {
  LoanReceivableAssignmentV2,
  AssignmentStatus,
} from '../entities/loanreceivable-assignment-v2.entity';

import { RetentionRuleV2 } from '../entities/retention-rule-v2.entity';

import { mapRetentionRule } from '../engine/dpd-category.mapper';

@Injectable()
export class LoanReceivableAssignmentV2Service {
  private readonly logger = new Logger(LoanReceivableAssignmentV2Service.name);

  constructor(
    /* ===============================
       ASSIGNMENTS DB (nittan_app)
    =============================== */
    @InjectRepository(LoanReceivableAssignmentV2, 'nittan_app')
    private readonly assignments: Repository<LoanReceivableAssignmentV2>,

    @InjectRepository(RetentionRuleV2, 'nittan_app')
    private readonly retentionRules: Repository<RetentionRuleV2>,

    /* ===============================
       CORE / LEGACY DB (nittan)
    =============================== */
    @InjectDataSource('nittan')
    private readonly nittanDataSource: DataSource,

    /* ===============================
       APP DB (users / agents)
    =============================== */
    @InjectDataSource('nittan_app')
    private readonly appDataSource: DataSource,
  ) {}

  /* ============================================================
     MANUAL RUN (API / ADMIN)
  ============================================================ */
  async run() {
    this.logger.log('▶ Manual assignment run triggered');
    await this.autoExpireAssignments();
    await this.assignReceivables();
  }

  /* ============================================================
     CRON — EVERY MINUTE
     - Expires old assignments
     - Reassigns fairly
     - Assigns new receivables
  ============================================================ */
  @Cron('0 */1 * * * *')
  async runScheduler() {
    this.logger.log('🔄 Running auto-expire + reassign');
    await this.autoExpireAssignments();
    await this.assignReceivables();
  }

  /* ============================================================
     AUTO EXPIRE ASSIGNMENTS
  ============================================================ */
  private async autoExpireAssignments() {
    const result = await this.assignments.update(
      {
        status: AssignmentStatus.ACTIVE,
        retentionUntil: LessThan(new Date()),
      },
      {
        status: AssignmentStatus.EXPIRED,
      },
    );

    if (result.affected && result.affected > 0) {
      this.logger.log(`⏳ Expired ${result.affected} assignments`);
    }
  }

  /* ============================================================
     MAIN ASSIGN ENGINE
  ============================================================ */
  private async assignReceivables() {
    const receivables = await this.fetchReceivables();
    if (!receivables.length) {
      this.logger.log('ℹ No receivables eligible for assignment');
      return;
    }

    let agents = await this.loadAgentsWithLoad();
    if (!agents.length) {
      this.logger.warn('⚠ No active collection agents found');
      return;
    }

    for (const loan of receivables) {
      // Sort by least loaded agent first
      agents.sort((a, b) => a.assignedCount - b.assignedCount);
      const agent = agents[0];

      if (!agent || agent.assignedCount >= 10) {
        continue;
      }

      // Prevent duplicate ACTIVE assignment
      const exists = await this.assignments.findOne({
        where: {
          loanReceivableId: loan.loanReceivableId,
          status: AssignmentStatus.ACTIVE,
        },
      });

      if (exists) {
        continue;
      }

      const rule = await this.getRetentionRule(loan.dpd);

      const retentionUntil =
        rule.retentionDays === null
          ? null
          : new Date(Date.now() + rule.retentionDays * 86400000);

      await this.assignments.save({
        loanReceivableId: loan.loanReceivableId,
        loanApplicationId: loan.loanApplicationId,
        dpd: loan.dpd,
        dpdCategory: rule.categoryCode,
        agentId: agent.agentId,
        retentionDays: rule.retentionDays,
        retentionUntil,
        status: AssignmentStatus.ACTIVE,
      });

      agent.assignedCount++;
    }

    this.logger.log('✅ Assignment cycle completed');
  }

  /* ============================================================
     FETCH RECEIVABLES
     - Due soon (<= 7 days)
     - Overdue
     - Not cleared (write-offs excluded)
  ============================================================ */
  private async fetchReceivables(): Promise<
    {
      loanReceivableId: number;
      loanApplicationId: number;
      dpd: number;
    }[]
  > {
    const sql = `
      SELECT TOP 200
        r.ID AS loanReceivableId,
        r.LoanApplicationId AS loanApplicationId,
        DATEDIFF(DAY, r.DueDate, GETDATE()) AS dpd
      FROM [Nittan].[dbo].[tblLoanReceivables] r
      WHERE r.Cleared = 0
        AND r.DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      ORDER BY dpd DESC
    `;

    const rows = await this.nittanDataSource.query(sql);
    this.logger.log(`📌 Receivables fetched: ${rows.length}`);

    return rows.map(r => ({
      loanReceivableId: Number(r.loanReceivableId),
      loanApplicationId: Number(r.loanApplicationId),
      dpd: Number(r.dpd ?? 0),
    }));
  }

  /* ============================================================
     LOAD AGENTS + CURRENT LOAD
  ============================================================ */
  private async loadAgentsWithLoad() {
    const sql = `
      SELECT
        ua.EmployeeId AS agentId
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%'
    `;

    const agents = await this.appDataSource.query(sql);

    const loads = await this.assignments
      .createQueryBuilder('a')
      .select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'assignedCount')
      .where('a.status = :status', {
        status: AssignmentStatus.ACTIVE,
      })
      .groupBy('a.agentId')
      .getRawMany();

    return agents.map(a => ({
      agentId: Number(a.agentId),
      assignedCount:
        Number(
          loads.find(l => Number(l.agentId) === Number(a.agentId))
            ?.assignedCount || 0,
        ),
    }));
  }

  /* ============================================================
     RETENTION RULE LOOKUP (CMS CONTROLLED)
  ============================================================ */

  private async getRetentionRule(dpd: number): Promise<RetentionRuleV2> {
    const rules = await this.retentionRules.find({
      where: { isActive: true },
      order: { dpdMin: 'ASC' },
    });
  
    const rule = mapRetentionRule(dpd, rules);
  
    if (!rule) {
      return {
        id: 0,
        categoryCode: 'UNKNOWN',
        dpdMin: dpd,
        dpdMax: dpd,
        retentionDays: 7,
        label: 'Fallback Rule',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RetentionRuleV2;
    }
  
    return rule;
  }

}
