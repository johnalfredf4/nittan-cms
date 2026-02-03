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

  @InjectDataSource('nittan_app')
  private readonly appDataSource: DataSource,

  @Inject(forwardRef(() => LoanReceivableAssignmentService))
  private readonly assignmentService: LoanReceivableAssignmentService,
  ) {}
  /* ============================================================
     FETCH AGENT WORKLOAD (ADMIN VIEW)
  ============================================================ */
  /* ============================================================
   FETCH AGENT WORKLOAD (ADMIN VIEW)
   Cross-database join via RAW SQL (SQL Server safe)
============================================================ */
async getWorkload(query: QueryAgentWorkloadDto) {
  let whereClause = 'WHERE 1=1';
  const params: Record<string, any> = {};

  if (query.agentId) {
    whereClause += ' AND a.agentId = @agentId';
    params.agentId = query.agentId;
  }

  if (query.status !== undefined) {
    whereClause += ' AND a.status = @status';
    params.status = query.status;
  }

  if (query.minDpd !== undefined) {
    whereClause += ' AND a.dpd >= @minDpd';
    params.minDpd = query.minDpd;
  }

  if (query.maxDpd !== undefined) {
    whereClause += ' AND a.dpd <= @maxDpd';
    params.maxDpd = query.maxDpd;
  }

  const sql = `
    SELECT
      a.id AS assignmentId,
      l.ApplicationCode AS acct,
      a.loanApplicationId,
      a.loanReceivableId,
      a.agentId,
      a.branchId,
      a.dpd,
      a.dpdCategory,
      a.retentionDays,
      a.retentionUntil,
      a.status,
      LTRIM(
        RTRIM(
          CONCAT(
            u.first_name, ' ',
            ISNULL(u.middle_name + ' ', ''),
            u.last_name
          )
        )
      ) AS agentFullName
    FROM [Nittan-App].[dbo].[LoanReceivable_Assignments] a
    LEFT JOIN [Nittan-App].[dbo].[User_Accounts] u
      ON u.EmployeeId = a.agentId
    INNER JOIN [Nittan].[dbo].[tblLoanApplications] l
      ON l.ID = a.loanApplicationId
    ${whereClause}
    ORDER BY a.dpd DESC
  `;

  return this.appDataSource.query(sql, params);
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
