import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

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
       LEGACY CORE DB (Nittan)
    =============================== */
    @InjectDataSource('nittan')
    private readonly nittanDataSource: DataSource,
  ) {}

  /* ============================================================
     MAIN ENTRY POINT
     - Saves MAIN borrower
     - Saves up to 3 co-borrowers
  ============================================================ */
  async createSnapshot(
    loanAssignmentId: number,
    borrowerId: number,
    coBorrowers?: {
      personId: number;
      relationshipId?: number;
      order: 1 | 2 | 3;
    }[],
  ): Promise<void> {
    this.logger.log(`📸 Creating snapshot for assignment ${loanAssignmentId}`);

    /* ===============================
       MAIN BORROWER
    =============================== */
    const mainPersonal = await this.fetchPersonalInfo(borrowerId);
    if (!mainPersonal) {
      this.logger.warn(`⚠ No personal info found for borrower ${borrowerId}`);
      return;
    }

    const mainSnapshot = await this.saveSnapshot(
      loanAssignmentId,
      borrowerId,
      mainPersonal,
      'MAIN',
    );

    await this.saveIdentifications(mainSnapshot, mainPersonal);
    await this.saveIncome(mainSnapshot, mainPersonal);
    await this.saveExpenses(mainSnapshot, mainPersonal);
    await this.saveReferences(mainSnapshot, mainPersonal);

    /* ===============================
       CO-BORROWERS (1–3)
    =============================== */
    if (coBorrowers?.length) {
      for (const cb of coBorrowers) {
        await this.createCoBorrowerSnapshot(
          loanAssignmentId,
          cb.personId,
          cb.order,
          cb.relationshipId,
        );
      }
    }

    this.logger.log(`✅ Snapshot process completed for assignment ${loanAssignmentId}`);
  }

  /* ============================================================
     CO-BORROWER SNAPSHOT
  ============================================================ */
  private async createCoBorrowerSnapshot(
    loanAssignmentId: number,
    personId: number,
    order: 1 | 2 | 3,
    relationshipId?: number,
  ) {
    const personal = await this.fetchPersonalInfo(personId);
    if (!personal) {
      this.logger.warn(`⚠ No personal info found for co-borrower ${personId}`);
      return;
    }

    const snapshot = await this.saveSnapshot(
      loanAssignmentId,
      personId,
      personal,
      'CO_BORROWER',
      order,
      relationshipId,
    );

    await this.saveIdentifications(snapshot, personal);
    await this.saveIncome(snapshot, personal);
    await this.saveExpenses(snapshot, personal);
    await this.saveReferences(snapshot, personal);
  }

  /* ============================================================
     SNAPSHOT SAVE (SHARED)
  ============================================================ */
  private async saveSnapshot(
    loanAssignmentId: number,
    personId: number,
    p: any,
    role: 'MAIN' | 'CO_BORROWER',
    order?: 1 | 2 | 3,
    relationshipId?: number,
  ): Promise<LoanAssignmentPersonalSnapshot> {
    return this.snapshotRepo.save({
      loanAssignmentId,
      personId,
      borrowerRole: role,
      coBorrowerOrder: role === 'CO_BORROWER' ? order : null,
      coBorrowerRelationshipId: role === 'CO_BORROWER' ? relationshipId : null,

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
    });
  }

  /* ============================================================
     LEGACY DATA FETCH
  ============================================================ */
  private async fetchPersonalInfo(personId: number): Promise<any> {
    const sql = `
      SELECT TOP 1 *
      FROM [Nittan].[dbo].[tblPersonalInfos]
      WHERE BorrowerNo = @0
      ORDER BY [Date] DESC
    `;
    const rows = await this.nittanDataSource.query(sql, [personId]);
    return rows[0];
  }

  /* ============================================================
     IDENTIFICATIONS
  ============================================================ */
  private async saveIdentifications(snapshot, p) {
    const ids = [];

    if (p.TINNo) ids.push({ idType: 'TIN', idNumber: p.TINNo });
    if (p.SSSNo) ids.push({ idType: 'SSS/GSIS/UMID', idNumber: p.SSSNo });
    if (p.PassportNo) ids.push({ idType: 'Passport', idNumber: p.PassportNo });
    if (p.VisaIDNum) ids.push({ idType: 'Visa', idNumber: p.VisaIDNum });

    if (ids.length) {
      await this.idRepo.save(ids.map(i => ({ ...i, snapshot })));
    }
  }

  /* ============================================================
     MONTHLY INCOME
  ============================================================ */
  private async saveIncome(snapshot, p) {
    if (p.MonthlySalary) {
      await this.incomeRepo.save({
        snapshot,
        incomeType: 'Applicant',
        amount: p.MonthlySalary,
      });
    }

    if (p.SpouseDept) {
      await this.incomeRepo.save({
        snapshot,
        incomeType: 'Spouse',
        amount: p.SpouseDept,
      });
    }
  }

  /* ============================================================
     MONTHLY EXPENSES
  ============================================================ */
  private async saveExpenses(snapshot, p) {
    if (!p.MonthlyAmort) return;

    await this.expenseRepo.save({
      snapshot,
      expenseType: 'Loan Deduction',
      amount: p.MonthlyAmort,
      creditor: p.Creditor,
      creditAmount: p.CreditAmount,
      outstandingBalance: p.UnpaidBalance,
    });
  }

  /* ============================================================
     CONTACT REFERENCES
  ============================================================ */
  private async saveReferences(snapshot, p) {
    const refs = [];

    if (p.ReferencePerson1) {
      refs.push({
        referenceName: p.ReferencePerson1,
        address: p.ReferencePerson1Address,
        employer: p.ReferencePerson1Employer,
        contactNumber: p.ReferencePerson1TelNum,
      });
    }

    if (p.ReferencePerson2) {
      refs.push({
        referenceName: p.ReferencePerson2,
        address: p.ReferencePerson2Address,
        employer: p.ReferencePerson2Employer,
        contactNumber: p.ReferencePerson2TelNum,
      });
    }

    if (refs.length) {
      await this.refRepo.save(refs.map(r => ({ ...r, snapshot })));
    }
  }
}
