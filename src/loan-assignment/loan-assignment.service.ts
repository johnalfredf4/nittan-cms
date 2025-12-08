import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { LocationType } from './types/location-type';
import { AccountClass } from './types/account-class';
import { LOCATION_HQ, LOCATION_BRANCH } from './constants/location-constants';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LoanAssignmentService {
  private readonly logger = new Logger(LoanAssignmentService.name);

  constructor(
    @InjectRepository(LoanAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanAssignment>,

    @InjectRepository(RotationState, 'nittan_app')
    private readonly rotationRepo: Repository<RotationState>,

    @InjectRepository(LoanAssignment, 'nittan_app')
    private readonly auditRepo: Repository<LoanAssignment>,

    private readonly nittanSource: DataSource,
    private readonly nittanAppSource: DataSource,
  ) {}

  /**
   * Runs rotation schedule
   */
  @Cron('*/10 * * * * *')
  async runRotation(): Promise<void> {
    this.logger.log('Starting loan rotation...');

    // Get accounts from source DB (Nittan)
    const loans = await this.fetchLoansFromSource();
    if (!loans?.length) {
      this.logger.warn('No due loans found. Rotation skipped.');
      return;
    }

    const grouped = this.groupByLocation(loans);

    await this.assignForLocation('HQ', grouped['HQ']);
    await this.assignForLocation('BRANCH', grouped['BRANCH']);


    this.logger.log('Loan rotation completed.');
  }

  /**
   * Reads due accounts from remote DB
   */
  private async fetchLoansFromSource(): Promise<any[]> {
    const query = `
      WITH NextReceivables AS (
          SELECT *,
                 ROW_NUMBER() OVER (
                     PARTITION BY LoanApplicationId
                     ORDER BY DueDate ASC
                 ) AS rn
          FROM [Nittan].[dbo].[tblLoanReceivables]
          WHERE Cleared = 0
            AND DueDate >= CAST(GETDATE() AS DATE)
            AND DueDate < DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT * FROM NextReceivables
      WHERE rn = 1
    `;

    return await this.nittanSource.query(query);
  }

  /**
   * Categorizes data into HQ | BRANCH groups
   */
  private groupByLocation(loans: any[]): Record<LocationType, any[]> {
    const grouped: Record<string, any[]> = {
      [LOCATION_HQ]: [],
      [LOCATION_BRANCH]: [],
    };

    for (const r of loans) {
      if (r.BranchId === null) grouped[LOCATION_HQ].push(r);
      else grouped['BRANCH'].push(r);
    }

    return grouped;
  }

  /**
   * Assign accounts to available agents
   */
  private async assignForLocation(location: LocationType, loans: any[]): Promise<void> {
    if (!loans.length) return;

    const agents = await this.fetchAgents(location);

    if (!agents.length) {
      this.logger.warn(`No agents available for location ${location}`);
      return;
    }

    const { branchId } = loans[0];

    let rotation = await this.rotationRepo.findOne({ where: { locationType: location, branchId } });

    if (!rotation) {
      rotation = this.rotationRepo.create({
        locationType: location,
        branchId: branchId,
        lastIndex: 0,
      });

      rotation = await this.rotationRepo.save(rotation);
    }

    let index = rotation.lastIndex ?? 0;

    for (const loan of loans) {
      const agent = agents[index % agents.length];

      const newAssignment = this.assignmentRepo.create({
        loanApplicationId: loan.LoanApplicationId,
        agentId: agent.id,
        branchId,
        locationType: location,
        accountClass: this.getAccountClass(loan.DPD ?? 0),
        retentionUntil: this.calculateRetention(loan.DPD ?? 0),
        createdAt: new Date(),
        active: true,
      });

      await this.assignmentRepo.save(newAssignment);

      index++;
    }

    rotation.lastIndex = index;
    await this.rotationRepo.save(rotation);
  }

  /**
   * Fetch agents assigned to location
   */
  private async fetchAgents(locationType: LocationType): Promise<any[]> {
    let roleName = locationType === LOCATION_HQ
      ? 'Collection Agent - Head Office'
      : 'Collection Agent - Branch';

    const query = `
      SELECT u.id, u.username, u.BranchId
      FROM [Nittan_App].[dbo].[User_Accounts] u
      INNER JOIN [Nittan_App].[dbo].[User_Roles] ur ON ur.user_id = u.id
      INNER JOIN [Nittan_App].[dbo].[Roles] r ON r.id = ur.role_id
      WHERE r.name = '${roleName}'
        AND u.status = 'ACTIVE'
    `;

    return await this.nittanAppSource.query(query);
  }

  /**
   * Convert DPD into enum class
   */
  private getAccountClass(dpd: number): AccountClass {
    if (dpd <= 0) return AccountClass.DPD_0;
    if (dpd <= 30) return AccountClass.DPD_1_30;
    if (dpd <= 60) return AccountClass.DPD_31_60;
    if (dpd <= 90) return AccountClass.DPD_61_90;
    if (dpd <= 120) return AccountClass.DPD_91_120;
    if (dpd <= 150) return AccountClass.DPD_121_150;
    if (dpd <= 180) return AccountClass.DPD_151_180;
    return AccountClass.DPD_181_PLUS;
  }

  /**
   * Retention date calculator
   */
  private calculateRetention(dpd: number): Date {
    let days = 7;

    if (dpd >= 181) days = 120;

    const result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }

  // -----------------------------------------------------
// AGENT QUEUE — list of accounts assigned to an agent
// -----------------------------------------------------
async getAgentQueue(agentId: number) {
  return this.assignmentRepo.find({
    where: { agentId, active: true },
    order: { createdAt: 'DESC' },
  });
}

// -----------------------------------------------------
// MANUAL OVERRIDE (single account)
// -----------------------------------------------------
async overrideAssignment(dto: { assignmentId: number; newAgentId: number }) {
  const assignment = await this.assignmentRepo.findOne({
    where: { id: dto.assignmentId },
  });

  if (!assignment) {
    throw new Error('Assignment not found');
  }

  assignment.agentId = dto.newAgentId;
  assignment.updatedAt = new Date();

  return this.assignmentRepo.save(assignment);
}

// -----------------------------------------------------
// BULK OVERRIDE (all accounts of an agent)
// -----------------------------------------------------
async bulkOverride(dto: { fromAgentId: number; toAgentId: number }) {
  const accounts = await this.assignmentRepo.find({
    where: { agentId: dto.fromAgentId, active: true },
  });

  for (const acc of accounts) {
    acc.agentId = dto.toAgentId;
    acc.updatedAt = new Date();
  }

  return this.assignmentRepo.save(accounts);
}

}






