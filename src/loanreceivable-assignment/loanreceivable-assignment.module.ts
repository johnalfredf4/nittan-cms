import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/* =======================
   Assignment Core
======================= */
import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

/* =======================
   Snapshot Module
======================= */
import { LoanAssignmentSnapshotModule } from './snapshot/loanassignment-snapshot.module';

@Module({
  imports: [
    /* ============================================
       Writable DB (Assignments ONLY)
    ============================================ */
    TypeOrmModule.forFeature(
      [LoanReceivableAssignment],
      'nittan_app',
    ),

    /* ============================================
       Read-only / Core DB
       (tblLoanReceivables, tblPersonalInfos, Users)
    ============================================ */
    TypeOrmModule.forFeature([], 'nittan'),

    /* ============================================
       Snapshot module (exports snapshot service)
    ============================================ */
    LoanAssignmentSnapshotModule,
  ],

  controllers: [
    LoanReceivableAssignmentController,
  ],

  providers: [
    LoanReceivableAssignmentService,
  ],

  exports: [
    LoanReceivableAssignmentService,
  ],
})
export class LoanReceivableAssignmentModule {}
