import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { LocationType } from './types/location-type';
import { AccountClass } from './types/account-class';
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

  // ----------------------------------------------------
  // DB QUERIES
  // ----------------------------------------------------
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
      SELECT * FROM NextReceivables WHERE rn = 1;
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

  async getAgentQueue(agentId: number) {
    return this.assignmentRepo.find({
      where: {
        agentId,
        active: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // ----------------------------------------------------
  // REASSIGNMENT FUNCTIONS
  // ----------------------------------------------------
  async overrideAssignment(dto: OverrideAssignmentDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: Number(dto.assignmentId) },
    });

    if (!assignment) throw new Error('Assignment not found');

    assignment.agentId = Number(dto.newAgentId);
    assignment.updatedAt = new Date();
    assignment.active = true;

    await this.assignmentRepo.save(assignment);

    return { success: true };
  }

  async bulkOverride(dto: BulkOverrideAssignmentDto) {
    const where: any = {
      agentId: Number(dto.fromAgentId),
      active: true,
    };

    if (dto.accountClass) where.accountClass = dto.accountClass;

    const list = await this.assignmentRepo.find({ where });

    for (const assignment of list) {
      assignment.agentId = Number(dto.toAgentId);
      assignment.active = true;
      assignment.updatedAt = new Date();
      await this.assignmentRepo.save(assignment);
    }

    return { updated: list.length };
  }

  // ----------------------------------------------------
  // AGENT GROUPING & LOCATION FILTERING
  // ----------------------------------------------------
  private groupReceivablesByLocation(receivables: any[]): Record<LocationType, any[]> {
    const grouped: Record<LocationType, any[]> = {
      HQ: [],
      BRANCH: [],
    };

    for (const r of receivables) {
      if (r.BranchId === null) grouped['HQ'].push(r);
      else grouped['BRANCH'].push(r);
    }

    return grouped;
  }

  private async getAgentsForLocation(
    locationType: LocationType,
    branchId: number | null,
  ) {
    const allAgents = await this.getAgents();

    if (locationType === 'HQ') {
      return allAgents.filter((a: any) =>
        a.roleName === 'Collection Agent - Head Office',
      );
    }

    return allAgents.filter(
      (a: any) =>
        a.roleName === 'Collection Agent - Branch' &&
        a.BranchId === branchId,
    );
  }

  // ----------------------------------------------------
  // CLASSIFICATION AND RETENTION
  // ----------------------------------------------------
  private classifyAccount(dueDate: Date) {
    const now = new Date();
    const dpd = Math.floor(
      (now.getTime() - new Date(dueDate).getTime()) / 86400000,
    );

    let retention = 7;
    let cls: AccountClass;

    if (dpd <= 0) cls = AccountClass.DPD_0;
    else if (dpd <= 30) cls = AccountClass.DPD_1_30;
    else if (dpd <= 60) cls = AccountClass.DPD_31_60;
    else if (dpd <= 90) cls = AccountClass.DPD_61_90;
    else if (dpd <= 120) cls = AccountClass.DPD_91_120;
    else if (dpd <= 150) cls = AccountClass.DPD_121_150;
    else if (dpd <= 180) cls = AccountClass.DPD_151_180;
    else {
      cls = AccountClass.DPD_181_PLUS;
      retention = 120;
    }

    return { dpd, retention, accountClass: cls };
  }

  // ----------------------------------------------------
  // MAIN ROTATION LOGIC (CRON JOB)
  // ----------------------------------------------------
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async runRotation() {
    this.logger.log('Starting loan rotation...');

    const receivables = await this.getReceivables();
    if (!receivables?.length) {
      this.logger.log('No receivables found.');
      return;
    }

    const grouped = this.groupReceivablesByLocation(receivables);

    for (const [locationKey, items] of Object.entries(grouped)) {
      const locationType = locationKey as LocationType;

      const branchIds =
        locationType === 'HQ'
          ? [null]
          : [...new Set(items.map((r: any) => r.BranchId))];

      for (const branchId of branchIds) {
        const filteredReceivables =
          locationType === 'HQ'
            ? items
            : items.filter((r: any) => r.BranchId === branchId);

        const agents = await this.getAgentsForLocation(locationType, branchId);
        if (!agents?.length) continue;

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

        let index = rotation.lastAssignedAgentIndex % agents.length;

        for (const rec of filteredReceivables) {
          const agent = agents[index];

          const { dpd, retention, accountClass } = this.classifyAccount(rec.DueDate);

          const until = new Date();
          until.setDate(until.getDate() + retention);

          const assign = this.assignmentRepo.create({
            loanApplicationId: rec.LoanApplicationId,
            agentId: agent.userId,
            branchId,
            locationType,
            dueDate: rec.DueDate,
            dpd,
            accountClass,
            retentionUntil: until,
            active: true,
          });

          await this.assignmentRepo.save(assign);

          index++;
          if (index >= agents.length) index = 0;
        }

        rotation.lastAssignedAgentIndex = index;
        rotation.updatedAt = new Date();
        await this.rotationRepo.save(rotation);
      }
    }

    this.logger.log('Loan rotation completed.');
  }
}
