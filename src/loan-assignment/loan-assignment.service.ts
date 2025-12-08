import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { LocationType } from './types/location-type';
import { AccountClass } from './types/account-class';
import { LOCATION_HQ, LOCATION_BRANCH } from './constants/location-constants';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '../users/entities/user.entity';


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

    @InjectRepository(User, 'nittan_app')
    private readonly userRepo: Repository<User>,

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

    // Assign HQ Loans
    await this.assignForLocation('HQ', grouped.HQ);
    
    // Assign Branch Loans PER BRANCH
    for (const branchId of Object.keys(grouped.BRANCH)) {
      const branchLoans = grouped.BRANCH[Number(branchId)];
      await this.assignForBranch(Number(branchId), branchLoans);
    }


    this.logger.log('Loan rotation completed.');
  }

  /**
   * Reads due accounts from remote DB
   */
  private async fetchLoansFromSource(): Promise<any[]> {
  const query = `
      WITH NextReceivables AS (
          SELECT TOP 200 LoanApplicationID,
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

  return await this.nittanSource.query(query);
}


  /**
   * Categorizes data into HQ | BRANCH groups
   */
  private groupByLocation(loans: any[]): {
  HQ: any[];
  BRANCH: Record<number, any[]>;
} {
  const grouped = {
    HQ: [],
    BRANCH: {} as Record<number, any[]>,
  };

  for (const r of loans) {
    if (!r.BranchId) {
      // belongs to HQ
      grouped.HQ.push(r);
    } else {
      // belongs to a specific branch
      if (!grouped.BRANCH[r.BranchId]) {
        grouped.BRANCH[r.BranchId] = [];
      }
      grouped.BRANCH[r.BranchId].push(r);
    }
  }

  return grouped;
}

private async getAgentsForLocation(location: string) {
  const rows = await this.nittanAppSource.query(`
    SELECT 
      ua.EmployeeId AS agentId,
      ua.BranchId,
      r.name AS roleName
    FROM User_Accounts ua
    INNER JOIN User_Roles ur ON ur.user_id = ua.id
    INNER JOIN Roles r ON r.id = ur.role_id
    WHERE ua.status = 1
      AND r.name = 'Collection Agent - Head Office'
  `);

  return rows.map((r) => ({
    agentId: r.agentId,
    BranchId: r.BranchId
  }));
}

private computeRetentionUntil(dpd: number): Date {
  let days = 7;

  if (dpd >= 181) days = 120;

  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}

private async getAgentsForBranch(branchId: number) {
  const rows = await this.nittanAppSource.query(
    `
    SELECT 
      ua.EmployeeId AS agentId,
      ua.BranchId,
      r.name AS roleName
    FROM User_Accounts ua
    INNER JOIN User_Roles ur ON ur.user_id = ua.id
    INNER JOIN Roles r ON r.id = ur.role_id
    WHERE ua.status = 1
      AND ua.BranchId = @0
      AND r.name = 'Collection Agent - Branch'
  `,
    [branchId],
  );

  return rows.map((r) => ({
    agentId: r.agentId,
    BranchId: r.BranchId
  }));
}

private async getRotationIndex(branchId: number | null): Promise<number> {
  const record = await this.rotationRepo.findOne({
    where: { branchId },
  });

  return record?.lastIndex ?? 0;
}

private async saveRotationIndex(branchId: number | null, newIndex: number): Promise<void> {
  let record = await this.rotationRepo.findOne({
    where: { branchId },
  });

  if (!record) {
    record = this.rotationRepo.create({
      branchId: branchId,
      lastIndex: newIndex,
      updatedAt: new Date(),
    });
  } else {
    record.lastIndex = newIndex;
    record.updatedAt = new Date();
  }

  await this.rotationRepo.save(record);
}

  /**
   * Assign accounts to available agents
   */
  private async assignForLocation(location: string, loans: any[]) {
  if (!loans.length) {
    this.logger.warn(`[NO HQ LOANS]`);
    return;
  }

  const agents = await this.getAgentsForLocation(location);

  if (!agents.length) {
    this.logger.warn(`[NO HQ AGENTS AVAILABLE]`);
    return;
  }

  let index = await this.getRotationIndex(null);
  const totalAgents = agents.length;
  const loanQueue = [...loans];

  while (loanQueue.length > 0) {
    const agent = agents[index % totalAgents];

    // take up to 10 loans
    const chunk = loanQueue.splice(0, 10);

    for (const loan of chunk) {
      await this.assignmentRepo.save({
        loanApplicationId: loan.LoanApplicationID,
        agentId: agent.agentId,
        accountClass: loan.CustomerClass ?? '',
        branchId: null,
        locationType: LOCATION_HQ,
        retentionUntil: this.computeRetentionUntil(loan.DPD),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    index++;
  }

  await this.saveRotationIndex(null, index);
}


private async assignForBranch(branchId: number, loans: any[]) {
  if (!loans.length) {
    this.logger.warn(`[NO BRANCH LOANS] Branch ${branchId}`);
    return;
  }

  const agents = await this.getAgentsForBranch(branchId);

  if (!agents.length) {
    this.logger.warn(`[NO AGENTS AVAILABLE FOR BRANCH ID ${branchId}]`);
    return;
  }

  let index = await this.getRotationIndex(branchId);
  const totalAgents = agents.length;
  const loanQueue = [...loans];

  while (loanQueue.length > 0) {
    const agent = agents[index % totalAgents];

    // take up to 10 loans per assignment
    const chunk = loanQueue.splice(0, 10);

    for (const loan of chunk) {
      await this.assignmentRepo.save({
        loanApplicationId: loan.LoanApplicationID,
        agentId: agent.agentId,
        accountClass: loan.CustomerClass ?? '',
        branchId: branchId,
        locationType: LOCATION_BRANCH,
        retentionUntil: this.computeRetentionUntil(loan.DPD),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    index++;
  }

  await this.saveRotationIndex(branchId, index);
}



  /**
   * Fetch agents assigned to location
   */
  private async fetchAgents(locationType: LocationType, branchId?: string): Promise<any[]> {
  const query = `
    SELECT 
      ua.EmployeeId AS agentId,
      ua.BranchId,
      r.name AS roleName
    FROM dbo.User_Accounts ua
    INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
    INNER JOIN dbo.Roles r ON r.id = ur.role_id
    WHERE ua.status = 1
      AND r.name LIKE 'Collection Agent%'
  `;

  const pool = await this.nittanAppSource.manager.connection;
  const agents = await pool.query(query);

  console.log('🔍 Raw Agents From DB:', agents);

  // Normalize values
  const normalizedAgents = agents.map(a => ({
    ...a,
    roleName: a.roleName?.trim().toLowerCase(),
    BranchId: a.BranchId ? String(a.BranchId).toLowerCase() : null,
  }));

  if (locationType === LOCATION_HQ) {
    return normalizedAgents.filter(a =>
      a.roleName.includes('head office') || a.roleName.includes('hq')
    );
  }

  if (locationType === LOCATION_BRANCH) {
    if (!branchId) return [];

    const normalizedBranchId = String(branchId).toLowerCase();

    const filtered = normalizedAgents.filter(a =>
      a.roleName.includes('branch') &&
      a.BranchId &&
      a.BranchId === normalizedBranchId
    );

    console.log(`🟦 Filtered Branch Agents for branchId= ${branchId} :`, filtered);

    return filtered;
  }

  return [];
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

  assignment.agentId = Number(dto.newAgentId);
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

async getAllAssignments() {
  return this.assignmentRepo.find({
    order: { createdAt: 'DESC' },
  });
}

 /**
   * Returns all agents who can receive assignments
   */
  async getAvailableAgents() {
    return await this.userRepo.query(`
      SELECT 
        ua.EmployeeId AS agentId,
        ua.BranchId,
        r.name AS roleName
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%'
    `);
  }

  /**
   * Returns assignments only for selected agent
   */
  async getAssignmentsForAgent(agentId: number) {
    return await this.assignmentRepo.find({
      where: { agentId },
      order: { createdAt: 'DESC' },
    });
  }
  
async getAgentsList() {
  const rows = await this.nittanAppSource.query(`
    SELECT 
      ua.EmployeeId AS agentId,
      ua.BranchId,
      r.name AS roleName
    FROM User_Accounts ua
    INNER JOIN User_Roles ur ON ur.user_id = ua.id
    INNER JOIN Roles r ON r.id = ur.role_id
    WHERE ua.status = 1
      AND r.name LIKE 'Collection Agent%'
  `);

  return rows.map((r) => ({
    agentId: r.agentId,
    branchId: r.BranchId,
    roleName: r.roleName,
  }));
}
/**
   * Updates record with new Agent ID
   */
  async reassignAssignment(assignmentId: number, newAgentId: number) {
    const row = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
    });

    if (!row) {
      throw new Error('Assignment not found');
    }

    row.agentId = Number(newAgentId);
    row.updatedAt = new Date();

    return this.assignmentRepo.save(row);
  }

}




























