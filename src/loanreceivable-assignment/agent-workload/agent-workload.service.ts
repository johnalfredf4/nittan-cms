import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanReceivableAssignment } from '../entities/loanreceivable-assignment.entity';
import { QueryAgentWorkloadDto } from './dto/query-agent-workload.dto';
import { ReassignLoanDto } from './dto/reassign-loan.dto';
import { LoanReceivableAssignmentService } from '../loanreceivable-assignment.service';

@Injectable()
export class AgentWorkloadService {
  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    private readonly assignmentService: LoanReceivableAssignmentService,
  ) {}

  /* ============================================================
     FETCH AGENT WORKLOAD (ADMIN VIEW)
  ============================================================ */
  async getWorkload(query: QueryAgentWorkloadDto) {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .select([
        'a.id AS assignmentId',
        'a.loanReceivableId',
        'a.loanApplicationId',
        'a.agentId',
        'a.branchId',
        'a.dpd',
        'a.dpdCategory',
        'a.retentionDays',
        'a.retentionUntil',
        'a.status',
      ])
      .orderBy('a.dpd', 'DESC');

    if (query.agentId) {
      qb.andWhere('a.agentId = :agentId', { agentId: query.agentId });
    }

    if (query.status) {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    if (query.minDpd !== undefined) {
      qb.andWhere('a.dpd >= :minDpd', { minDpd: query.minDpd });
    }

    if (query.maxDpd !== undefined) {
      qb.andWhere('a.dpd <= :maxDpd', { maxDpd: query.maxDpd });
    }

    return qb.getRawMany();
  }

  /* ============================================================
     REASSIGN SINGLE LOAN RECEIVABLE
  ============================================================ */
  async reassign(dto: ReassignLoanDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: dto.assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.assignmentService.overrideSingle(
      dto.assignmentId,
      { toAgentId: dto.toAgentId },
    );
  }
}
