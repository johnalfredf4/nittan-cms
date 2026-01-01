import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import {
  Repository,
  LessThan,
  DataSource,
} from 'typeorm';
import { Cron } from '@nestjs/schedule';

import {
  LoanReceivableAssignment,
  DpdCategory,
  AssignmentStatus,
} from './entities/loanreceivable-assignment.entity';

import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';
import { OverrideSingleDto } from './dto/override-single.dto';
import { LoanAssignmentPersonalSnapshotService } from './snapshot/loanassignment-personal-snapshot.service';

@Injectable()
export class LoanReceivableAssignmentService {
  private readonly logger = new Logger(LoanReceivableAssignmentService.name);

  constructor(
    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,

    /* ===============================
       SNAPSHOT SERVICE
    =============================== */
    private readonly snapshotService: LoanAssignmentPersonalSnapshotService,

    @InjectDataSource('nittan')
    private readonly nittanDataSource: DataSource,

    @InjectDataSource('nittan_app')
    private readonly appDataSource: DataSource,
  ) {}

  /* ============================================================
     FETCH RECEIVABLES (UPDATED)
  ============================================================ */
  private async loadReceivablesForAssignment(): Promise<any[]> {
    const sql = `
      WITH NextReceivables AS (
        SELECT TOP 200
          r.Id                AS LoanReceivableId,
          r.LoanApplicationID AS LoanApplicationID,
          la.BorrowerID       AS BorrowerID,

          la.CoBorrower1Id,
          la.CoBorrower1RelationshipId,
          la.CoBorrower2Id,
          la.CoBorrower2RelationshipId,
          la.CoBorrower3Id,
          la.CoBorrower3RelationshipId,

          r.DueDate,
          DATEDIFF(DAY, r.DueDate, GETDATE()) AS DPD,
          ROW_NUMBER() OVER (
            PARTITION BY r.LoanApplicationID
            ORDER BY r.DueDate ASC
          ) AS rn
        FROM [Nittan].[dbo].[tblLoanReceivables] r
        INNER JOIN [Nittan].[dbo].[tblLoanApplications] la
          ON la.Id = r.LoanApplicationID
        WHERE r.Cleared = 0
          AND r.DueDate <= DATEADD(DAY, 7, CAST(GETDATE() AS DATE))
      )
      SELECT *
      FROM NextReceivables
      WHERE rn = 1;
    `;

    return this.nittanDataSource.query(sql);
  }

  /* ============================================================
     CRON — EVERY MINUTE
  ============================================================ */
  @Cron('0 * * * * *')
  async assignLoans(): Promise<void> {
    this.logger.log('🔄 Starting receivable assignment process');

    await this.autoExpireAssignments();

    const loans = await this.loadReceivablesForAssignment();
    if (!loans.length) return;

    let agents = await this.loadAgents();
    if (!agents.length) return;

    const loads = await this.getAgentLoad({});
    agents = agents.map(a => ({
      ...a,
      assignedCount:
        loads.find(l => l.agentId === a.agentId)?.assignedCount ?? 0,
    }));

    for (const loan of loans) {
      agents.sort((a, b) => a.assignedCount - b.assignedCount);
      const agent = agents[0];
      if (!agent || agent.assignedCount >= 10) continue;

      const retentionDays = this.getRetentionDays(loan.DPD);

      try {
        const result = await this.assignmentRepo.insert({
          loanReceivableId: loan.LoanReceivableId,
          loanApplicationId: loan.LoanApplicationID,
          agentId: agent.agentId,
          branchId: agent.branchId,
          dpd: loan.DPD,
          dpdCategory: this.getDpdCategory(loan.DPD),
          locationType: agent.branchId ? 'BRANCH' : 'HQ',
          retentionDays,
          retentionUntil: new Date(Date.now() + retentionDays * 86400000),
          status: AssignmentStatus.ACTIVE,
        });

        const assignmentId = result.identifiers[0].id;

        /* ===============================
           BUILD CO-BORROWERS ARRAY
        =============================== */
        const coBorrowers = [];

        if (loan.CoBorrower1Id) {
          coBorrowers.push({
            personId: loan.CoBorrower1Id,
            relationshipId: loan.CoBorrower1RelationshipId,
            order: 1,
          });
        }

        if (loan.CoBorrower2Id) {
          coBorrowers.push({
            personId: loan.CoBorrower2Id,
            relationshipId: loan.CoBorrower2RelationshipId,
            order: 2,
          });
        }

        if (loan.CoBorrower3Id) {
          coBorrowers.push({
            personId: loan.CoBorrower3Id,
            relationshipId: loan.CoBorrower3RelationshipId,
            order: 3,
          });
        }

        /* ===============================
           TRANSACTIONAL SNAPSHOT SAVE
        =============================== */
        await this.snapshotService.createSnapshotTransactional(
          assignmentId,
          loan.BorrowerID,
          coBorrowers,
        );

        agent.assignedCount++;
      } catch (err) {
        this.logger.error('❌ Failed to assign receivable', err);
      }
    }

    this.logger.log('✅ Loan receivable assignment completed');
  }

  /* ============================================================
     (UNCHANGED METHODS BELOW)
  ============================================================ */

  private async autoExpireAssignments(): Promise<void> {
    await this.assignmentRepo.update(
      {
        status: AssignmentStatus.ACTIVE,
        retentionUntil: LessThan(new Date()),
      },
      { status: AssignmentStatus.EXPIRED },
    );
  }

  async findActiveAssignmentsByAgent(agentId: number) {
    return this.assignmentRepo.find({
      where: { agentId, status: AssignmentStatus.ACTIVE },
      order: { dpd: 'DESC' },
    });
  }

  async getAgentLoad(query: { agentId?: number }) {
    const qb = this.assignmentRepo
      .createQueryBuilder('a')
      .select('a.agentId', 'agentId')
      .addSelect('COUNT(*)', 'assignedCount')
      .where('a.status = :status', { status: AssignmentStatus.ACTIVE })
      .groupBy('a.agentId');

    if (query.agentId) {
      qb.having('a.agentId = :agentId', { agentId: query.agentId });
    }

    return (await qb.getRawMany()).map(r => ({
      agentId: Number(r.agentId),
      assignedCount: Number(r.assignedCount),
    }));
  }

  async overrideSingle(assignmentId: number, dto: OverrideSingleDto) {
    await this.assignmentRepo.update(
      { id: assignmentId },
      { agentId: dto.toAgentId, updatedAt: new Date() },
    );
    return { ok: true };
  }

  async bulkOverrideAssignments(dto: BulkOverrideAssignmentDto) {
    const result = await this.assignmentRepo.update(
      { agentId: dto.fromAgentId, status: AssignmentStatus.ACTIVE },
      { agentId: dto.toAgentId, updatedAt: new Date() },
    );

    return { ok: true, reassigned: result.affected ?? 0 };
  }

  async markProcessed(assignmentId: number, agentId: number) {
    const result = await this.assignmentRepo.update(
      { id: assignmentId, agentId, status: AssignmentStatus.ACTIVE },
      { status: AssignmentStatus.PROCESSED, updatedAt: new Date() },
    );

    if (!result.affected) {
      throw new NotFoundException('Assignment not found');
    }

    return { ok: true };
  }

  private async loadAgents(): Promise<any[]> {
    const sql = `
      SELECT
        ua.EmployeeId AS agentId,
        ua.BranchId   AS branchId
      FROM dbo.User_Accounts ua
      INNER JOIN dbo.User_Roles ur ON ur.user_id = ua.id
      INNER JOIN dbo.Roles r ON r.id = ur.role_id
      WHERE ua.status = 1
        AND r.name LIKE 'Collection Agent%';
    `;
  
    const agents = await this.appDataSource.query(sql);
  
    return agents.map(a => ({
      agentId: Number(a.agentId),
      branchId: a.branchId ?? null,
      assignedCount: 0,
    }));
  }

  private getRetentionDays(dpd: number): number {
    return dpd >= 181 ? 120 : 7;
  }

  private getDpdCategory(dpd: number): DpdCategory {
    if (dpd <= 0) return DpdCategory.DPD_0;
    if (dpd <= 30) return DpdCategory.DPD_1_30;
    if (dpd <= 60) return DpdCategory.DPD_31_60;
    if (dpd <= 90) return DpdCategory.DPD_61_90;
    if (dpd <= 120) return DpdCategory.DPD_91_120;
    if (dpd <= 150) return DpdCategory.DPD_121_150;
    if (dpd <= 180) return DpdCategory.DPD_151_180;
    return DpdCategory.DPD_181_PLUS;
  }

  async getLoanProfile(assignmentId: number) {
  /* ===============================
     PERSONAL SNAPSHOTS
  =============================== */
    const snapshots = await this.appDataSource.query(
      `
      SELECT
        Id,
        LoanAssignmentId,
        PersonId,
        PersonalInfoId,
        LastName,
        FirstName,
        MiddleName,
        Suffix,
        Title,
        Alias,
        DateOfBirth,
        PlaceOfBirth,
        Gender,
        NumDependents,
        CivilStatus,
        Nationality,
        MotherMaidenName,
        FatherName,
        MobileNumber,
        OfficeContactNumber,
        HomePhoneNumber,
        EmailAddress,
        FacebookAccount,
        PresentAddress,
        PresentYearsOfStay,
        PresentOwnershipType,
        PermanentAddress,
        PermanentYearsOfStay,
        PermanentOwnershipType,
        EmployerName,
        BusinessNature,
        EmploymentAddress,
        YearsOfService,
        EmployerContactNumber,
        EmployerEmail,
        JobTitle,
        SpouseLastName,
        SpouseFirstName,
        SpouseMiddleName,
        SpouseNickName,
        SpouseDateOfBirth,
        SpousePlaceOfBirth,
        SpouseMobileNumber,
        SpouseEmployerName,
        SpouseEmployerContact,
        SpouseJobTitle,
        CreatedAt,
        UpdatedAt,
        BorrowerRole,
        CoBorrowerOrder,
        CoBorrowerRelationshipId
      FROM dbo.LoanAssignment_PersonalSnapshot
      WHERE LoanAssignmentId = @0
      ORDER BY
        CASE WHEN BorrowerRole = 'MAIN' THEN 0 ELSE 1 END,
        CoBorrowerOrder
      `,
      [assignmentId],
    );
  
    if (!snapshots.length) {
      return { assignmentId, borrowers: [] };
    }
  
    const snapshotIds = snapshots.map(s => s.Id);
  
    /* ===============================
       CHILD TABLES
    =============================== */
    const [
      incomes,
      expenses,
      identifications,
      references,
      attachments,
    ] = await Promise.all([
      this.appDataSource.query(
        `
        SELECT
          Id,
          PersonalSnapshotId,
          IncomeType,
          Amount,
          BankName,
          BankBranch,
          AccountNumber
        FROM dbo.LoanAssignment_MonthlyIncome
        WHERE PersonalSnapshotId IN (${snapshotIds.join(',')})
        `,
      ),
  
      this.appDataSource.query(
        `
        SELECT
          Id,
          PersonalSnapshotId,
          ExpenseType,
          Amount,
          Creditor,
          CreditAmount,
          OutstandingBalance
        FROM dbo.LoanAssignment_MonthlyExpenses
        WHERE PersonalSnapshotId IN (${snapshotIds.join(',')})
        `,
      ),
  
      this.appDataSource.query(
        `
        SELECT
          Id,
          PersonalSnapshotId,
          IdType,
          IdNumber,
          DateIssued,
          CountryIssued
        FROM dbo.LoanAssignment_Identifications
        WHERE PersonalSnapshotId IN (${snapshotIds.join(',')})
        `,
      ),
  
      this.appDataSource.query(
        `
        SELECT
          Id,
          PersonalSnapshotId,
          ReferenceName,
          Address,
          ContactNumber,
          Employer
        FROM dbo.LoanAssignment_ContactReferences
        WHERE PersonalSnapshotId IN (${snapshotIds.join(',')})
        `,
      ),
  
      this.appDataSource.query(
        `
        SELECT
          Id,
          PersonalSnapshotId,
          AttachmentType,
          FilePath,
          UploadedAt
        FROM dbo.LoanAssignment_Attachments
        WHERE PersonalSnapshotId IN (${snapshotIds.join(',')})
        `,
      ),
    ]);
  
    /* ===============================
       GROUP RESPONSE
    =============================== */
    return {
      assignmentId,
      borrowers: snapshots.map(snapshot => ({
        snapshot,
        incomes: incomes.filter(i => i.PersonalSnapshotId === snapshot.Id),
        expenses: expenses.filter(e => e.PersonalSnapshotId === snapshot.Id),
        identifications: identifications.filter(
          i => i.PersonalSnapshotId === snapshot.Id,
        ),
        references: references.filter(
          r => r.PersonalSnapshotId === snapshot.Id,
        ),
        attachments: attachments.filter(
          a => a.PersonalSnapshotId === snapshot.Id,
        ),
      })),
    };
  }


}


