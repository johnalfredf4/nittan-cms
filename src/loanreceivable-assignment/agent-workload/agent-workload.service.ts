import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
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

  @Inject(forwardRef(() => LoanReceivableAssignmentService))
  private readonly assignmentService: LoanReceivableAssignmentService,
  ) {}
  /* ============================================================
     FETCH AGENT WORKLOAD (ADMIN VIEW)
  ============================================================ */
  async getWorkload(query: QueryAgentWorkloadDto) {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .leftJoin(
        'User_Accounts',
        'u',
        'u.EmployeeId = a.agentId',
      )
      .select([
        'a.id AS assignmentId',
        'a.loanReceivableId AS loanReceivableId',
        'a.loanApplicationId AS loanApplicationId',
        'a.agentId AS agentId',
        'a.branchId AS branchId',
        'a.dpd AS dpd',
        'a.dpdCategory AS dpdCategory',
        'a.retentionDays AS retentionDays',
        'a.retentionUntil AS retentionUntil',
        'a.status AS status',
        `
        LTRIM(
          RTRIM(
            CONCAT(
              u.first_name, ' ',
              ISNULL(u.middle_name + ' ', ''),
              u.last_name
            )
          )
        ) AS agentFullName
        `,
      ])
      .orderBy('a.dpd', 'DESC');
  
    if (query.agentId) {
      qb.andWhere('a.agentId = :agentId', {
        agentId: query.agentId,
      });
    }
  
    if (query.status) {
      qb.andWhere('a.status = :status', {
        status: query.status,
      });
    }
  
    if (query.minDpd !== undefined) {
      qb.andWhere('a.dpd >= :minDpd', {
        minDpd: query.minDpd,
      });
    }
  
    if (query.maxDpd !== undefined) {
      qb.andWhere('a.dpd <= :maxDpd', {
        maxDpd: query.maxDpd,
      });
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

  async getAgents() {
    return this.assignmentRepo.query(`
      SELECT DISTINCT
        ua.EmployeeId AS agentId,
        LTRIM(
          RTRIM(
            CONCAT(
              ua.first_name, ' ',
              ISNULL(ua.middle_name + ' ', ''),
              ua.last_name
            )
          )
        ) AS fullName,
        ua.BranchId AS branchId
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%'
      ORDER BY fullName
    `);
  }
}
