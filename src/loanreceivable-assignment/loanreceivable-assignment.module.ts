import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

@Module({
  imports: [
    /* ============================================
       Writable DB (Assignments)
    ============================================ */
    TypeOrmModule.forFeature(
      [LoanReceivableAssignment],
      'nittan_app',
    ),

    /* ============================================
       Read-only / Core DB (tblLoanReceivables,
       tblPersonalInfos, User_Accounts, etc.)
    ============================================ */
    TypeOrmModule.forFeature([], 'nittan'),
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
