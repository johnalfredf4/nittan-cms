import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, In } from 'typeorm';

import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LocationType, RawReceivableRow } from './types';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';

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

  // GET ALL ACTIVE ASSIGNMENTS FOR AN AGENT
  async getQueueForAgent(agentId: number) {
    return this.assignmentRepo.find({
      where: {
        agentId,
        processed: false,
      },
      order: { retentionUntil: 'ASC' },
    });
  }

  async markAsProcessed(id: number) {
    await this.assignmentRepo.update(
      { id },
      {
        processed: true,
        updatedAt: new Date(),
      },
    );
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async runAssignmentCron() {
    this.logger.log('Starting loan receivable assignment rotation...');

    await this.expireOldAssignments();

    const agents = await this.fetchAllAgents();
    if (!agents.length) {
      this.logger.warn('No collection agents found.');
      return;
    }

    const activeCounts = await this.getActiveCountsByAgent();
    const receivables = await this.fetchCandidateReceivables();

    if (!receivables.length) {
      this.logger.log('No loan receivables available.');
      return;
    }

    const toSave: LoanReceivableAssignment[] = [];

    // HQ agents
    const hqAgents = agents.filter(a => a.branchId == null);
    const hqLoans = receivables.filter(r => r.BranchId == null);

    if (hqAgents.length) {
      toSave.push(...this.distributeToAgents(hqLoans, hqAgents, activeCounts, 'HQ'));
    }

    // Branch agents
    const groupedAgents = new Map<number, AgentRow[]>();
    for (const a of agents.filter(a => a.branchId != null)) {
      if (!groupedAgents.has(a.branchId!)) groupedAgents.set(a.branchId!, []);
      groupedAgents.get(a.branchId!)!.push(a);
    }

    const groupedLoans = new Map<number, RawReceivableRow[]>();
    for (const r of receivables.filter(r => r.BranchId != null)) {
      if (!groupedLoans.has(r.BranchId!)) groupedLoans.set(r.BranchId!, []);
      groupedLoans.get(r.BranchId!)!.push(r);
    }

    for (const [branchId, branchLoans] of groupedLoans.entries()) {
      const branchAgents = groupedAgents.get(branchId) ?? [];
      toSave.push(...this.distributeToAgents(branchLoans, branchAgents, activeCounts, 'BRANCH', branchId));
    }

    if (toSave.length) {
      await this.assignmentRepo.save(toSave);
      this.logger.log(`Created ${toSave.length} new assignments.`);
    } else {
      this.logger.log('No new assignments created.');
    }
  }

  // AUTO SETTER OF EXPIRED ASSIGNMENTS
  private async expireOldAssignments() {
    await this.assignmentRepo.update(
      {
        retentionUntil: In([null]),
        processed: false,
      },
      {}
    );

    await this.assignmentRepo.update(
      {
        processed: false,
        retentionUntil: LessThan(new Date()),
      },
      {
        processed: true,
        updatedAt: new Date(),
      },
    );
  }

  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    return await this.assignmentRepo.update(
      {
        agentId: dto.fromAgentId,
        ...(dto.accountClass && { accountClass: dto.accountClass }),
      },
      { agentId: dto.toAgentId },
    );
  }

  private async fetchAllAgents(): Promise<AgentRow[]> {
    const sql = `
      SELECT 
        ua.id AS agentId,
        ua.BranchId AS branchId,
        r.name AS roleName
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name IN ('Collection Agent - Head Office', 'Collection Agent - Branch')
    `;
    return await this.cmsDb.query(sql);
  }

  private async getActiveCountsByAgent(): Promise<Map<number, number>> {
    const rows = await this.assignmentRepo
      .createQueryBuilder('a')
      .select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'cnt')
      .where('a.processed = 0')
      .gr
