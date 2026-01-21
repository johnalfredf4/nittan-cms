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
  DpdCategory,
} from '../entities/loanreceivable-assignment-v2.entity';

import { RetentionRuleV2 } from '../entities/retention-rule-v2.entity';

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
     CRON — EVERY MINUTE
     - Expires old assignments
     - Rebalances
     - Assigns new receivables
  ============================================================ */
  @Cron('0 */1 * * * *')
  async runScheduler() {
    this.logger.log('🔄 Running auto-expire + reassign');

    await this.autoExpireAssignments();
    await this.assignReceivables();
  }

  /* ============================================================
     AUTO EXPIRE
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

    if (result.affected) {
      this.logger.log(`⏳ Expired ${result.affected} assignments`);
    }
  }

  /* ============================================================
     MAIN ASSIGN ENGINE
  ============================================================ */
  private async assignReceivables() {
    const receivables = await this.fetchReceivables();
    if (!receivables.length) return;

    let agents = await this.loadAgentsWithLoad();
    if (!agents.length) return;

    for (const loan of receivables) {
      // Balance agent load
      agents.sort((a, b) => a.assignedCount - b.assignedCount);
      const agent = agents[0];

      if (!agent || agent.assignedCount >= 10) continue;

      // Prevent duplicate ACTIVE assignment
      const exists = await this.assignments.findOne({
        where: {
          loanReceivableId: loan.loanReceivableId,
          status: AssignmentStatus.ACTIVE,
        },
      });

      if (exists) continue;

      const rule = await this.getRetentionRule(loan.dpd);

      const retentionUntil =
        rule.retentionDays === null
          ? null
          : new Date(Date.now() + rule.retentionDays * 86400000);

      await this.assignments.save({
        loanReceivableId: loan.loanReceivableId,
        loanApplicationId: loan.loanApplicationId,
        dpd: loan.dpd,
        dpdCategory: rule.category,
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
  ============================================================ */
  private async fetchReceivables(): Promise<any[]> {
    const sql = `
      SELECT TOP 200
        r.ID AS loanReceivableId,
        r.LoanApplicationId AS loanApplicationId,
        r.DueDate,
        DATEDIFF(DAY, r.DueDate, GETDATE()) AS dpd
      FROM [Nittan].[dbo].[tblLoanReceivables] r
      WHERE r.Cleared = 0
        AND r.DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      ORDER BY dpd DESC
    `;

    const rows = await this.nittanDataSource.query(sql);
    this.logger.log(`📌 Receivables fetched: ${rows.length}`);
    return rows;
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
    let category: DpdCategory;

    if (dpd <= 0) category = DpdCategory.CAT1;
    else if (dpd <= 30) category = DpdCategory.CAT2;
    else if (dpd <= 60) category = DpdCategory.CAT3;
    else if (dpd <= 90) category = DpdCategory.CAT4;
    else if (dpd <= 120) category = DpdCategory.CAT5;
    else if (dpd <= 150) category = DpdCategory.CAT6;
    else if (dpd <= 180) category = DpdCategory.CAT7;
    else category = DpdCategory.CAT8;

    const rule = await this.retentionRules.findOne({
      where: { category },
    });

    if (!rule) {
      return {
        id: 0,
        category,
        retentionDays: category === DpdCategory.CAT8 ? null : 7,
        label: category,
        active: true,
      } as RetentionRuleV2;
    }

    return rule;
  }
}
