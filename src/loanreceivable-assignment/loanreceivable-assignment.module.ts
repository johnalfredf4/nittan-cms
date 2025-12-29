import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/* =======================
   Assignment Core
======================= */
import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

/* =======================
   Snapshot Entities
======================= */
import { LoanAssignmentPersonalSnapshot } from './snapshot/entities/loan-assignment-personal-snapshot.entity';
import { LoanAssignmentIdentification } from './snapshot/entities/loan-assignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './snapshot/entities/loan-assignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './snapshot/entities/loan-assignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './snapshot/entities/loan-assignment-contact-reference.entity';

/* =======================
   Snapshot Service
======================= */
import { LoanAssignmentPersonalSnapshotService } from './snapshot/loan-assignment-personal-snapshot.service';

@Module({
  imports: [
    /* ============================================
       Writable DB (Assignments + Snapshots)
    ============================================ */
    TypeOrmModule.forFeature(
      [
        LoanReceivableAssignment,

        // Snapshot tables
        LoanAssignmentPersonalSnapshot,
        LoanAssignmentIdentification,
        LoanAssignmentMonthlyIncome,
        LoanAssignmentMonthlyExpense,
        LoanAssignmentContactReference,
      ],
      'nittan_app',
    ),

    /* ============================================
       Read-only / Core DB
       (tblLoanReceivables, tblPersonalInfos, Users)
    ============================================ */
    TypeOrmModule.forFeature([], 'nittan'),
  ],

  controllers: [
    LoanReceivableAssignmentController,
  ],

  providers: [
    LoanReceivableAssignmentService,
    LoanAssignmentPersonalSnapshotService,
  ],

  exports: [
    LoanReceivableAssignmentService,
  ],
})
export class LoanReceivableAssignmentModule {}
