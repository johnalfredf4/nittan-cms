import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { LocationType } from './types/location-type';
import { AccountClass } from './types/account-class';

@Injectable()
export class LoanAssignmentService {
  private readonly logger = new Logger('LoanAssignmentService');

  constructor(
    @InjectRepository(LoanAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanAssignment>,

    @InjectRepository(RotationState, 'nittan_app')
    private readonly rotationRepo: Repository<RotationState>,

    @InjectDataSource('nittan')
    private readonly nittanDataSource: DataSource,

    @InjectDataSource('nittan_app')
    private readonly nittanAppDataSource: DataSource,
  ) {}

  /**
   * MAIN SCHEDULER ENTRY
   */
  async runRotation() {
    this.logger.log('Starting loan rotation...');

    const upcomingLoans = await this.fetchNextReceivables();

    if (!upcomingLoans.length) {
      this.logger.warn('No receivables found for rotation period');
      return;
    }

    const agents = await this.fetchAgentsFromApp();

    for (const loan of upcomingLoans) {
      const branchId = loan.BranchId ?? null;
      const locationType: LocationType = branchId ? 'BRANCH' : 'HQ';

      const filteredAgents = this.filterAgents(agents, locationType, branchId);

      if (!filteredAgents.length) {
        this.logger.warn(
          `No agents found for loan ${loan.LoanApplicationId}`,
        );
        continue;
      }

      let rotation = await this.rotationRepo.findOne({
        where: {
          locationType: locationType,
          branchId: branchId,
        },
      });

      if (!rotation) {
        rotation = await this.rotationRepo.save({
          locationType,
          branchId,
          lastAssignedAgentIndex: 0,
        });
      }

      const index = rotation.lastAssignedAgentIndex % filteredAgents.length;
      const selectedAgent = filteredAgents[index];

      await this.assignmentRepo.save({
        loanApplicationId: loan.LoanApplicationId,
        agentId: selectedAgent.agentId,
        branchId,
        locationType,
        accountClass: this.getAccountClass(loan.DPD),
        retentionUntil: this.calculateRetention(loan.DPD),
        createdAt: new Date(),
        active: true,
      });

      // SAFEST UPDATE — avoids identity collision
      await this.rotationRepo.update(rotation.id, {
        lastAssignedAgentIndex: index + 1,
        updatedAt: new Date(),
      });
    }

    this.logger.log('Loan assignment rotation completed.');
  }

  /**
   * QUERY RECEIVABLES FROM SOURCE DB
   */
  private async fetchNextReceivables() {
    return await this.nittanDataSource.query(`
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
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `);
  }

  /**
   * READ AGENTS FROM APP DB
   */
  private async fetchAgentsFromApp() {
    return await this.nittanAppDataSource.query(`
      SELECT ua.id AS agentId,
             ua.first_name + ' ' + ua.last_name AS fullName,
             ua.BranchId,
             r.name AS role
      FROM User_Accounts ua
      INNER JOIN User_Roles ur ON ua.id = ur.user_id
      INNER JOIN Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
    `);
  }

  /**
   * FILTER AGENTS BASED ON LOCATION
   */
  private filterAgents(allAgents: any[], locationType: LocationType, branchId: number | null) {
    return allAgents.filter(agent => {
      if (locationType === 'HQ') {
        return agent.role === 'Collection Agent - Head Office';
      }

      return (
        agent.role === 'Collection Agent - Branch' &&
        agent.BranchId === branchId
      );
    });
  }

  /**
   * MAP DPD TO ACCOUNT CLASS
   */
  getAccountClass(dpd: number): AccountClass {
  if (dpd <= 0) return AccountClass.ZeroDPD;
  if (dpd <= 30) return AccountClass.OneTo30DPD;
  if (dpd <= 60) return AccountClass.ThirtyOneTo60DPD;
  if (dpd <= 90) return AccountClass.SixtyOneTo90DPD;
  if (dpd <= 120) return AccountClass.NinetyOneTo120DPD;
  if (dpd <= 150) return AccountClass.OneTwentyOneTo150DPD;
  if (dpd <= 180) return AccountClass.OneFiftyOneTo180DPD;
  return AccountClass.OneEightyPlusDPD;
}

  /**
   * CALCULATE END OF RETENTION
   */
  private calculateRetention(dpd: number): Date {
    let days = 7;
    if (dpd >= 181) days = 120;

    const now = new Date();
    now.setDate(now.getDate() + days);
    return now;
  }

  /**
   * PROVIDES AGENT QUEUE
   */
  async getAgentQueue(userId: number) {
    return await this.assignmentRepo.find({
      where: { agentId: userId, active: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * MANUAL OVERRIDE SINGLE
   */
  async overrideAssignment(dto: { assignmentId: number, newAgentId: number }) {
    const existing = await this.assignmentRepo.findOne({
      where: { id: dto.assignmentId.toString() },
    });

    if (!existing) throw new Error('Assignment not found');

    existing.active = false;
    await this.assignmentRepo.save(existing);

    return await this.assignmentRepo.save({
      loanApplicationId: existing.loanApplicationId,
      agentId: dto.newAgentId,
      branchId: existing.branchId,
      locationType: existing.locationType,
      accountClass: existing.accountClass,
      retentionUntil: existing.retentionUntil,
      createdAt: new Date(),
      active: true,
    });
  }

  /**
   * MANUAL BULK OVERRIDE
   */
  async bulkOverride(dto: { fromAgentId: number, toAgentId: number }) {
    const assignments = await this.assignmentRepo.find({
      where: { agentId: dto.fromAgentId, active: true },
    });

    for (const row of assignments) {
      row.active = false;
      await this.assignmentRepo.save(row);

      await this.assignmentRepo.save({
        loanApplicationId: row.loanApplicationId,
        agentId: dto.toAgentId,
        branchId: row.branchId,
        locationType: row.locationType,
        accountClass: row.accountClass,
        retentionUntil: row.retentionUntil,
        createdAt: new Date(),
        active: true,
      });
    }

    return {
      message: 'Bulk override completed',
      count: assignments.length,
    };
  }
}

