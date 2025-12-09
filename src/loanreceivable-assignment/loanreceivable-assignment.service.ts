import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LocationType, RawReceivableRow } from './types';

interface AgentRow {
  agentId: number;
  branchId: number | null;
  roleName: string;
}

@Injectable()
export class LoanreceivableAssignmentService {
  private readonly logger = new Logger(LoanreceivableAssignmentService.name);
  private readonly MAX_PER_AGENT = 10;

  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    @InjectDataSource('nittan_app')
    private readonly cmsDb: DataSource,

    @InjectDataSource('nittan')
    private readonly coreDb: DataSource,
  ) {}

  // ==== PUBLIC API FOR CONTROLLER ====
  async getQueueForAgent(agentId: number) {
    return this.assignmentRepo.find({
      where: {
        agentId,
        status: 'ACTIVE',
      },
      order: { retentionUntil: 'ASC' },
    });
  }

  async markAsProcessed(id: number) {
    await this.assignmentRepo.update(
      { id },
      { status: 'PROCESSED', updatedAt: new Date() },
    );
  }

  // ==== CRON JOB: Top up queues ====
  @Cron(CronExpression.EVERY_5_MINUTES)
  async runAssignmentCron() {
    this.logger.log('Starting loan receivable assignment rotation...');

    // 1) Expire assignments whose retention has ended
    await this.expireOldAssignments();

    // 2) Load all collection agents (HQ + Branch)
    const agents = await this.fetchAllAgents();
    if (!agents.length) {
      this.logger.warn('No collection agents found. Skipping rotation.');
      return;
    }

    // 3) Current active counts per agent
    const activeCounts = await this.getActiveCountsByAgent();

    // 4) Fetch candidate receivables from core DB
    const receivables = await this.fetchCandidateReceivables();
    if (!receivables.length) {
      this.logger.log('No available loan receivables for assignment.');
      return;
    }

    // Split agents into HQ and branches
    const hqAgents = agents.filter(
      (a) => a.roleName === 'Collection Agent - Head Office',
    );
    const branchAgentsById = new Map<number, AgentRow[]>();
    agents
      .filter((a) => a.roleName === 'Collection Agent - Branch' && a.branchId != null)
      .forEach((a) => {
        const list = branchAgentsById.get(a.branchId!) || [];
        list.push(a);
        branchAgentsById.set(a.branchId!, list);
      });

    // Group receivables by location/branch
    const hqReceivables = receivables.filter((r) => r.BranchId == null);
    const branchReceivablesById = new Map<number, RawReceivableRow[]>();
    receivables
      .filter((r) => r.BranchId != null)
      .forEach((r) => {
        const list = branchReceivablesById.get(r.BranchId!) || [];
        list.push(r);
        branchReceivablesById.set(r.BranchId!, list);
      });

    const toSave: LoanReceivableAssignment[] = [];

    // 5) Assign HQ receivables
    if (hqAgents.length && hqReceivables.length) {
      const created = this.distributeToAgents(
        hqReceivables,
        hqAgents,
        activeCounts,
        'HQ',
      );
      toSave.push(...created);
    }

    // 6) Assign branch receivables per branch
    for (const [branchId, list] of branchReceivablesById.entries()) {
      const branchAgents = branchAgentsById.get(branchId) || [];
      if (!branchAgents.length) {
        this.logger.warn(
          `No branch agents for BranchId=${branchId}. Skipping its receivables.`,
        );
        continue;
      }
      const created = this.distributeToAgents(
        list,
        branchAgents,
        activeCounts,
        'BRANCH',
        branchId,
      );
      toSave.push(...created);
    }

    if (toSave.length) {
      await this.assignmentRepo.save(toSave);
      this.logger.log(`Created ${toSave.length} new loan receivable assignments.`);
    } else {
      this.logger.log('No assignments created (all agents already full).');
    }

    this.logger.log('Loan receivable assignment rotation completed.');
  }

  // Mark expired assignments
  private async expireOldAssignments() {
    await this.assignmentRepo.update(
      {
        status: 'ACTIVE',
        retentionUntil: new Date(Date.now() - 1), // < now
      },
      {
        status: 'EXPIRED',
        updatedAt: new Date(),
      },
    );
  }

  // Load HQ + Branch agents from Nittan-App
  private async fetchAllAgents(): Promise<AgentRow[]> {
    const sql = `
      SELECT 
        ua.id        AS agentId,
        ua.BranchId  AS branchId,
        r.name       AS roleName
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r       ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name IN ('Collection Agent - Head Office', 'Collection Agent - Branch')
    `;
    const rows = await this.cmsDb.manager.query(sql);
    return rows as AgentRow[];
  }

  // Count ACTIVE assignments per agent
  private async getActiveCountsByAgent(): Promise<Map<number, number>> {
    const rows = await this.assignmentRepo
      .createQueryBuilder('a')
      .select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'cnt')
      .where('a.status = :status', { status: 'ACTIVE' })
      .andWhere('a.retentionUntil > GETDATE()')
      .groupBy('a.agentId')
      .getRawMany<{ agentId: number; cnt: string }>();

    const map = new Map<number, number>();
    for (const r of rows) {
      map.set(Number(r.agentId), Number(r.cnt));
    }
    return map;
  }

  // Fetch candidate receivables from core DB using the SQL above
  private async fetchCandidateReceivables(): Promise<RawReceivableRow[]> {
    const sql = `
      DECLARE @maxPool INT = 1000;

      ;WITH NextReceivables AS (
          SELECT
              r.Id AS LoanReceivableId,
              r.LoanApplicationId,
              r.DueDate,
              DATEDIFF(DAY, r.DueDate, CAST(GETDATE() AS DATE)) AS DPD,
              ROW_NUMBER() OVER (
                  PARTITION BY r.LoanApplicationId
                  ORDER BY r.DueDate ASC
              ) AS rn
          FROM [Nittan].dbo.tblLoanReceivables r
          WHERE r.Cleared = 0
      ),
      Filtered AS (
          SELECT
              nr.LoanReceivableId,
              nr.LoanApplicationId,
              nr.DueDate,
              nr.DPD,
              la.BranchId
          FROM NextReceivables nr
          INNER JOIN [Nittan].dbo.tblLoanApplications la
              ON la.Id = nr.LoanApplicationId
          WHERE nr.rn = 1
            AND (
                  nr.DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
                )
      ),
      Unassigned AS (
          SELECT f.*
          FROM Filtered f
          LEFT JOIN [Nittan-App].dbo.LoanReceivable_Assignments a
              ON a.loanApplicationId = f.LoanApplicationId
             AND a.status = 'ACTIVE'
             AND a.retentionUntil > GETDATE()
          WHERE a.id IS NULL
      ),
      Tagged AS (
          SELECT
              *,
              CASE 
                  WHEN DPD = 0 THEN 'DPD_0'
                  WHEN DPD BETWEEN 1 AND 30 THEN 'DPD_1_30'
                  WHEN DPD BETWEEN 31 AND 60 THEN 'DPD_31_60'
                  WHEN DPD BETWEEN 61 AND 90 THEN 'DPD_61_90'
                  WHEN DPD BETWEEN 91 AND 120 THEN 'DPD_91_120'
                  WHEN DPD BETWEEN 121 AND 150 THEN 'DPD_121_150'
                  WHEN DPD BETWEEN 151 AND 180 THEN 'DPD_151_180'
                  WHEN DPD >= 181 THEN 'DPD_181_UP'
              END AS DPDCategory,
              CASE 
                  WHEN DPD >= 181 THEN 120
                  ELSE 7
              END AS RetentionDays
          FROM Unassigned
      ),
      Ranked AS (
          SELECT *,
              ROW_NUMBER() OVER (
                  ORDER BY DPD DESC, DueDate ASC
              ) AS RankOrder
          FROM Tagged
      )
      SELECT TOP (@maxPool) *
      FROM Ranked
      ORDER BY DPD DESC, DueDate ASC;
    `;

    const rows = await this.coreDb.query(sql);
    return rows as RawReceivableRow[];
  }

  // Even distribution core
  private distributeToAgents(
    receivables: RawReceivableRow[],
    agents: AgentRow[],
    activeCounts: Map<number, number>,
    locationType: LocationType,
    branchId: number | null = null,
  ): LoanReceivableAssignment[] {
    if (!receivables.length || !agents.length) return [];

    // copy arrays so we can sort without side-effects
    const loans = [...receivables].sort((a, b) => {
      // more overdue first
      if (b.DPD !== a.DPD) return b.DPD - a.DPD;
      // then earlier due date
      return new Date(a.DueDate).getTime() - new Date(b.DueDate).getTime();
    });

    // compute slots left
    const agentState = agents.map((a) => {
      const current = activeCounts.get(a.agentId) || 0;
      return {
        agent: a,
        active: current,
      };
    });

    // if everyone full, skip
    if (agentState.every((s) => s.active >= this.MAX_PER_AGENT)) {
      this.logger.log(
        `All agents for location=${locationType}${
          branchId != null ? ` branch=${branchId}` : ''
        } are at max capacity.`,
      );
      return [];
    }

    // randomize starting index to avoid bias
    let agentIndex = Math.floor(Math.random() * agentState.length);
    let loanIndex = 0;

    const created: LoanReceivableAssignment[] = [];

    // simple loop until we exhaust loans or no more capacity
    while (loanIndex < loans.length) {
      const anyCapacity = agentState.some((s) => s.active < this.MAX_PER_AGENT);
      if (!anyCapacity) break;

      const state = agentState[agentIndex];
      agentIndex = (agentIndex + 1) % agentState.length;

      if (state.active >= this.MAX_PER_AGENT) {
        continue;
      }

      const loan = loans[loanIndex++];
      const retentionDays = loan.RetentionDays;
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + retentionDays);

      const assignment = this.assignmentRepo.create({
        loanApplicationId: loan.LoanApplicationId,
        loanReceivableId: (loan as any).LoanReceivableId ?? null,
        agentId: state.agent.agentId,
        branchId: branchId ?? null,
        locationType,
        dpd: loan.DPD,
        dpdCategory: loan.DPDCategory,
        retentionDays,
        retentionUntil,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      created.push(assignment);
      state.active++;
    }

    return created;
  }
}
