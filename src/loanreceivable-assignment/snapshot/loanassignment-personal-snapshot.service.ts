import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './entities/loanassignment-personal-snapshot.entity';
import { LoanAssignmentIdentification } from './entities/loanassignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './entities/loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './entities/loanassignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './entities/loanassignment-contact-reference.entity';

@Injectable()
export class LoanAssignmentPersonalSnapshotService {
  private readonly logger = new Logger(LoanAssignmentPersonalSnapshotService.name);

  constructor(
    /* ===============================
       SNAPSHOT REPOSITORIES (nittan_app)
    =============================== */
    @InjectRepository(LoanAssignmentPersonalSnapshot, 'nittan_app')
    private readonly snapshotRepo: Repository<LoanAssignmentPersonalSnapshot>,

    @InjectRepository(LoanAssignmentIdentification, 'nittan_app')
    private readonly idRepo: Repository<LoanAssignmentIdentification>,

    @InjectRepository(LoanAssignmentMonthlyIncome, 'nittan_app')
    private readonly incomeRepo: Repository<LoanAssignmentMonthlyIncome>,

    @InjectRepository(LoanAssignmentMonthlyExpense, 'nittan_app')
    private readonly expenseRepo: Repository<LoanAssignmentMonthlyExpense>,

    @InjectRepository(LoanAssignmentContactReference, 'nittan_app')
    private readonly refRepo: Repository<LoanAssignmentContactReference>,

    /* ===============================
       APP DB (WRITE / TRANSACTION)
    =============================== */
    @InjectDataSource('nittan_app')
    private readonly appDataSource: DataSource,

    /* ===============================
       LEGACY CORE DB (READ ONLY)
    =============================== */
    @InjectDataSource('nittan')
    private readonly nittanDataSource: DataSource,
  ) {}

  /* ============================================================
     PUBLIC ENTRY POINT (TRANSACTIONAL)
  ============================================================ */
  async createSnapshotTransactional(
    loanAssignmentId: number,
    borrowerId: number,
    coBorrowers?: {
      personId: number;
      relationshipId?: number;
      order: 1 | 2 | 3;
    }[],
  ): Promise<void> {
    await this.appDataSource.transaction(async manager => {
      await this.createSnapshotWithManager(
        manager,
        loanAssignmentId,
        borrowerId,
        coBorrowers,
      );
    });
  }

  /* ============================================================
     INTERNAL TRANSACTION WORKER
  ============================================================ */
  private async createSnapshotWithManager(
    manager: EntityManager,
    loanAssignmentId: number,
    borrowerId: number,
    coBorrowers?: {
      personId: number;
      relationshipId?: number;
      order: 1 | 2 | 3;
    }[],
  ): Promise<void> {
    const snapshotRepo = manager.getRepository(LoanAssignmentPersonalSnapshot);
    const idRepo = manager.getRepository(LoanAssignmentIdentification);
    const incomeRepo = manager.getRepository(LoanAssignmentMonthlyIncome);
    const expenseRepo = manager.getRepository(LoanAssignmentMonthlyExpense);
    const refRepo = manager.getRepository(LoanAssignmentContactReference);

    this.logger.log(`📸 Creating snapshots (TX) for assignment ${loanAssignmentId}`);

    /* ===============================
       MAIN BORROWER
    =============================== */
    const mainPersonal = await this.fetchPersonalInfo(borrowerId);
    if (!mainPersonal) {
      this.logger.warn(`⚠ No personal info found for borrower ${borrowerId}`);
      return;
    }

    const mainSnapshot = await snapshotRepo.save(
      this.buildSnapshotEntity(
        loanAssignmentId,
        borrowerId,
        mainPersonal,
        'MAIN',
      ),
    );

    await this.saveIdentificationsTx(idRepo, mainSnapshot, mainPersonal);
    await this.saveIncomeTx(incomeRepo, mainSnapshot, mainPersonal);
    await this.saveExpensesTx(expenseRepo, mainSnapshot, mainPersonal);
    await this.saveReferencesTx(refRepo, mainSnapshot, mainPersonal);

    /* ===============================
       CO-BORROWERS (MAX 3)
    =============================== */
    for (const cb of coBorrowers ?? []) {
      const personal = await this.fetchPersonalInfo(cb.personId);
      if (!personal) continue;

      const snapshot = await snapshotRepo.save(
        this.buildSnapshotEntity(
          loanAssignmentId,
          cb.personId,
          personal,
          'CO_BORROWER',
          cb.order,
          cb.relationshipId,
        ),
      );

      await this.saveIdentificationsTx(idRepo, snapshot, personal);
      await this.saveIncomeTx(incomeRepo, snapshot, personal);
      await this.saveExpensesTx(expenseRepo, snapshot, personal);
      await this.saveReferencesTx(refRepo, snapshot, personal);
    }

    this.logger.log(`✅ Snapshot transaction completed for assignment ${loanAssignmentId}`);
  }

  /* ============================================================
     SNAPSHOT ENTITY BUILDER (CAMELCASE ONLY)
  ============================================================ */
  private buildSnapshotEntity(
    loanAssignmentId: number,
    PersonId: number,
    p: any,
    role: 'MAIN' | 'CO_BORROWER',
    order?: 1 | 2 | 3,
    relationshipId?: number,
  ): Partial<LoanAssignmentPersonalSnapshot> {
    return {
      loanAssignmentId,
      PersonId,
      BorrowerRole: role,
      CoBorrowerOrder: role === 'CO_BORROWER' ? order : null,
      CoBorrowerRelationshipId: role === 'CO_BORROWER' ? relationshipId : null,

      personalInfoId: p.ID,

      lastName: p.LastName,
      firstName: p.FirstName,
      middleName: p.MiddleName,
      alias: p.NickName,
      dateOfBirth: p.DateOfBirth,
      placeOfBirth: p.BirthPlace,
      gender: p.Sex,
      civilStatus: p.MaritalStatus,
      numDependents: p.NumDependents,
      nationality: p.Dept,

      mobileNumber: p.CellNum,
      homePhoneNumber: p.TelNum1,
      emailAddress: p.EmployerEmail,

      presentAddress: `${p.StreetName ?? ''} ${p.BarangaySubdivision ?? ''} ${p.CityProvince ?? ''}`.trim(),

      employerName: p.EmployerName,
      employmentAddress: p.EmployerAddress,
      yearsOfService: p.YearsInService,
      jobTitle: p.Occupation,

      spouseFirstName: p.SpouseFirstName,
      spouseMiddleName: p.SpouseMiddleName,
      spouseLastName: p.SpouseLastName,
      spouseEmployerName: p.SpouseEmployer,
      spouseMobileNumber: p.SpouseTelNum,
    };
  }

  /* ============================================================
     LEGACY DATA FETCH (nittan)
  ============================================================ */
  private async fetchPersonalInfo(personId: number): Promise<any> {
    const sql = `
      SELECT TOP 1 *
      FROM [Nittan].[dbo].[tblPersonalInfos]
      WHERE [ID] = @0
      ORDER BY [Date] DESC
    `;
    const rows = await this.nittanDataSource.query(sql, [personId]);
    return rows[0];
  }

  /* ============================================================
     TRANSACTION-SAFE CHILD SAVES
  ============================================================ */
  private async saveIdentificationsTx(repo, snapshot, p) {
    const ids = [];

    if (p.TINNo) ids.push({ idType: 'TIN', idNumber: p.TINNo });
    if (p.SSSNo) ids.push({ idType: 'SSS/GSIS/UMID', idNumber: p.SSSNo });
    if (p.PassportNo) ids.push({ idType: 'Passport', idNumber: p.PassportNo });
    if (p.VisaIDNum) ids.push({ idType: 'Visa', idNumber: p.VisaIDNum });

    if (ids.length) {
      await repo.save(ids.map(i => ({ ...i, snapshot })));
    }
  }

  private async saveIncomeTx(repo, snapshot, p) {
    if (p.MonthlySalary) {
      await repo.save({
        snapshot,
        incomeType: 'Applicant',
        amount: p.MonthlySalary,
      });
    }

    if (p.SpouseDept) {
      await repo.save({
        snapshot,
        incomeType: 'Spouse',
        amount: p.SpouseDept,
      });
    }
  }

  private async saveExpensesTx(repo, snapshot, p) {
    if (!p.MonthlyAmort) return;

    await repo.save({
      snapshot,
      expenseType: 'Loan Deduction',
      amount: p.MonthlyAmort,
      creditor: p.Creditor,
      creditAmount: p.CreditAmount,
      outstandingBalance: p.UnpaidBalance,
    });
  }

  private async saveReferencesTx(repo, snapshot, p) {
    const refs = [];

    if (p.ReferencePerson1) {
      refs.push({
        referenceName: p.ReferencePerson1,
        address: p.ReferencePerson1Address,
        employer: p.ReferencePerson1Employer,
        contactNumber: p.ReferencePerson1TelNum,
         // ✅ NEW COLUMNS
        section: 'Relatives',
        relationship: p.ReferencePerson1Relationship ?? null,
      });
    }

    if (p.ReferencePerson2) {
      refs.push({
        referenceName: p.ReferencePerson2,
        address: p.ReferencePerson2Address,
        employer: p.ReferencePerson2Employer,
        contactNumber: p.ReferencePerson2TelNum,
        // ✅ NEW COLUMNS
        section: 'Relatives',
        relationship: p.ReferencePerson2Relationship ?? null,
      });
    }

    if (refs.length) {
      await repo.save(refs.map(r => ({ ...r, snapshot })));
    }
  }
}
