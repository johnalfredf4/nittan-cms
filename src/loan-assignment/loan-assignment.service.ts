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

  private groupReceivablesByLocation(receivables: any[]) {
  const grouped: Record<string, any[]> = {
    HQ: [],
    BRANCH: [],
  };

  for (const r of receivables) {
    if (r.BranchId === null) grouped.HQ.push(r);
    else grouped.BRANCH.push(r);
  }

  return grouped;
}

private async getAgentsForLocation(
  locationType: LocationType,
  branchId: number | null,
) {
  const allAgents = await this.getAgents();

  if (locationType === LocationType.HQ) {
    return allAgents.filter(a => a.roleName === 'Collection Agent - Head Office');
  }

  return allAgents.filter(
    a => a.roleName === 'Collection Agent - Branch' && a.BranchId === branchId,
  );
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
  this.logger.log('Processing rotation...');

  const receivables = await this.getReceivables();

  if (!receivables?.length) {
    this.logger.log('No receivables found.');
    return;
  }

  const grouped = this.groupReceivablesByLocation(receivables);

  for (const [locationType, items] of Object.entries(grouped)) {
    const branchIds =
      locationType === LocationType.HQ
        ? [null]
        : [...new Set(items.map(r => r.BranchId))]; // unique BranchId values

    for (const branchId of branchIds) {
      const filteredReceivables =
        locationType === LocationType.HQ
          ? items
          : items.filter(r => r.BranchId === branchId);

      const filteredAgents = await this.getAgentsForLocation(locationType, branchId);
      if (!filteredAgents?.length) continue;

      let rotation = await this.rotationRepo.findOne({
        where: { locationType, branchId },
      });

      if (!rotation) {
        rotation = this.rotationRepo.create({
          locationType,
          branchId,
          lastAssignedAgentIndex: 0,
        });
        rotation = await this.rotationRepo.save(rotation);
      }

      let index = rotation.lastAssignedAgentIndex % filteredAgents.length;

      for (const rec of filteredReceivables) {
        const agent = filteredAgents[index];

        await this.assignmentRepo.save(
          this.assignmentRepo.create({
            loanApplicationId: rec.LoanApplicationId,
            dueDate: rec.DueDate,
            agentId: agent.userId,
            locationType,
            branchId,
            assignedAt: new Date(),
          }),
        );

        index++;
        if (index >= filteredAgents.length) index = 0;
      }

      rotation.lastAssignedAgentIndex = index;
      rotation.updatedAt = new Date();
      await this.rotationRepo.save(rotation);
    }
  }

  this.logger.log('Rotation completed.');
}



