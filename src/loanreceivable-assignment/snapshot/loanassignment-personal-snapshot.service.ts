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
  ============================================================ */
  async createSnapshot(
    loanAssignmentId: number,
    borrowerId: number,
  ): Promise<void> {
    this.logger.log(`📸 Creating snapshot for assignment ${loanAssignmentId}`);

    const personal = await this.fetchPersonalInfo(borrowerId);
    if (!personal) {
      this.logger.warn(`⚠ No personal info found for borrower ${borrowerId}`);
      return;
    }

    const snapshot = await this.snapshotRepo.save({
      loanAssignmentId,
      borrowerId,
      personalInfoId: personal.ID,

      lastName: personal.LastName,
      firstName: personal.FirstName,
      middleName: personal.MiddleName,
      alias: personal.NickName,
      dateOfBirth: personal.DateOfBirth,
      placeOfBirth: personal.BirthPlace,
      gender: personal.Sex,
      civilStatus: personal.MaritalStatus,
      numDependents: personal.NumDependents,
      nationality: personal.Dept,

      mobileNumber: personal.CellNum,
      homePhoneNumber: personal.TelNum1,
      emailAddress: personal.EmployerEmail,

      presentAddress: `${personal.StreetName ?? ''} ${personal.BarangaySubdivision ?? ''} ${personal.CityProvince ?? ''}`.trim(),

      employerName: personal.EmployerName,
      employmentAddress: personal.EmployerAddress,
      yearsOfService: personal.YearsInService,
      jobTitle: personal.Occupation,

      spouseFirstName: personal.SpouseFirstName,
      spouseMiddleName: personal.SpouseMiddleName,
      spouseLastName: personal.SpouseLastName,
      spouseEmployerName: personal.SpouseEmployer,
      spouseMobileNumber: personal.SpouseTelNum,
    });

    await this.saveIdentifications(snapshot, personal);
    await this.saveIncome(snapshot, personal);
    await this.saveExpenses(snapshot, personal);
    await this.saveReferences(snapshot, personal);

    this.logger.log(`✅ Snapshot saved for assignment ${loanAssignmentId}`);
  }

  /* ============================================================
     LEGACY DATA FETCH
  ============================================================ */
  private async fetchPersonalInfo(borrowerId: number): Promise<any> {
    const sql = `
      SELECT TOP 1 *
      FROM [Nittan].[dbo].[tblPersonalInfos]
      WHERE BorrowerNo = @0
      ORDER BY [Date] DESC
    `;
    const rows = await this.nittanDataSource.query(sql, [borrowerId]);
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
