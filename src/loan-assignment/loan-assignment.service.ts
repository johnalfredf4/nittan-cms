import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import {
  LoanAssignment,
  AccountClass,
  LocationType,
} from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OverrideAssignmentDto } from './dto/override-assignment.dto';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Injectable()
export class LoanAssignmentService {
  private readonly logger = new Logger(LoanAssignmentService.name);

  constructor(
    @InjectRepository(LoanAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanAssignment>,

    @InjectRepository(RotationState, 'nittan_app')
    private readonly rotationRepo: Repository<RotationState>,

    @InjectDataSource('nittan')
    private readonly nittanDs: DataSource,

    @InjectDataSource('nittan_app')
    private readonly nittanAppDs: DataSource,
  ) {}

  private async getReceivables() {
    const sql = `
      WITH NextReceivables AS (
        SELECT r.*,
               a.BranchId,
               ROW_NUMBER() OVER (
                   PARTITION BY r.LoanApplicationId
                   ORDER BY r.DueDate ASC
               ) AS rn
        FROM [Nittan].[dbo].[tblLoanReceivables] r
        INNER JOIN [Nittan].[dbo].[tblLoanApplications] a
            ON a.Id = r.LoanApplicationId
        WHERE r.Cleared = 0
          AND r.DueDate >= CAST(GETDATE() AS DATE)
          AND r.DueDate < DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `;
    return this.nittanDs.query(sql);
  }

  private async getAgents() {
    const sql = `
      SELECT ua.id AS userId,
             ua.first_name,
             ua.last_name,
             ua.BranchId,
             r.name AS roleName
      FROM [dbo].[User_Accounts] ua
      JOIN [dbo].[User_Roles] ur ON ua.id = ur.user_id
      JOIN [dbo].[Roles] r ON ur.role_id = r.id
      WHERE r.name IN ('Collection Agent - Head Office', 'Collection Agent - Branch')
        AND ua.status = 1;
    `;
    return this.nittanAppDs.query(sql);
  }

  private classifyAccount(dueDate: Date) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));

    let retention = 7;
    let cls: AccountClass;

    if (diff <= 0) cls = AccountClass.DPD_0;
    else if (diff <= 30) cls = AccountClass.DPD_1_30;
    else if (diff <= 60) cls = AccountClass.DPD_31_60;
    else if (diff <= 90) cls = AccountClass.DPD_61_90;
    else if (diff <= 120) cls = AccountClass.DPD_91_120;
    else if (diff <= 150) cls = AccountClass.DPD_121_150;
    else if (diff <= 180) cls = AccountClass.DPD_151_180;
    else {
      cls = AccountClass.DPD_181_PLUS;
      retention = 120;
    }

    return { dpd: diff, retention, accountClass: cls };
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async runRotation() {
    this.logger.log('Running loan assignment rotation...');

    const [receivables, agents] = await Promise.all([this.getReceivables(), this.getAgents()]);

    if (!receivables.length) return;

    const existing = await this.assignmentRepo.find({
      where: {
        loanApplicationId: In(receivables.map(r => r.LoanApplicationId)),
        active: true,
      },
    });

    const skipIds = new Set(existing.map(x => x.loanApplicationId));
    const eligible = receivables.filter(r => !skipIds.has(r.LoanApplicationId));

    const grouped = new Map<string, any[]>();

    for (const r of eligible) {
      const branchId = r.BranchId ?? null;
      const locationType = branchId === null ? LocationType.HQ : LocationType.BRANCH;
      const key = `${locationType}:${branchId ?? ''}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(r);
    }

    const assignmentRecords: LoanAssignment[] = [];

    for (const [key, items] of grouped) {
      const [loc, branch] = key.split(':');
      const branchId = branch ? Number(branch) : null;

      const filteredAgents = agents.filter(a => {
        if (loc === LocationType.HQ)
          return a.roleName === 'Collection Agent - Head Office';
        return a.roleName === 'Collection Agent - Branch' && a.BranchId === branchId;
      });

      if (!filteredAgents.length) continue;

      const rotation = await this.getRotationState(loc as LocationType, branchId);

      let index = rotation.lastAssignedAgentIndex % filteredAgents.length;

      for (const r of items) {
        const { dpd, retention, accountClass } = this.classifyAccount(r.DueDate);

        const retentionUntil = new Date();
        retentionUntil.setDate(retentionUntil.getDate() + retention);

        const agent = filteredAgents[index];
        index = (index + 1) % filteredAgents.length;
