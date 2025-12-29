import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/* =======================
   Snapshot Entities
======================= */
import { LoanAssignmentPersonalSnapshot } from './entities/loanassignment-personal-snapshot.entity';
import { LoanAssignmentIdentification } from './entities/loanassignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './entities/loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './entities/loanassignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './entities/loanassignment-contact-reference.entity';

/* =======================
   Snapshot Service
======================= */
import { LoanAssignmentPersonalSnapshotService } from './loanassignment-personal-snapshot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        LoanAssignmentPersonalSnapshot,
        LoanAssignmentIdentification,
        LoanAssignmentMonthlyIncome,
        LoanAssignmentMonthlyExpense,
        LoanAssignmentContactReference,
      ],
      'nittan_app',
    ),

    TypeOrmModule.forFeature([], 'nittan'),
  ],

  providers: [
    LoanAssignmentPersonalSnapshotService,
  ],

  exports: [
    LoanAssignmentPersonalSnapshotService,
  ],
})
export class LoanAssignmentSnapshotModule {}

