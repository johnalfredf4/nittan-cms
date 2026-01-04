import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/* =======================
   Assignment Core
======================= */
import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

/* =======================
   Personal Snapshot EDIT API
======================= */
import { PersonalSnapshotController } from './controller/personal-snapshot.controller';
import { PersonalSnapshotEditService } from './service/personal-snapshot-edit.service';

/* =======================
   Snapshot Module
======================= */
import { LoanAssignmentSnapshotModule } from './snapshot/loanassignment-snapshot.module';

/* =======================
   Monthly Income CRUD
======================= */
import { LoanAssignmentMonthlyIncomeModule } from './monthly-income/loanassignment-monthly-income.module';
import { LoanAssignmentMonthlyExpenseModule } from './monthly-expenses/loanassignment-monthly-expense.module';

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
           Read-only / Core DB (Legacy)
        ============================================ */
        TypeOrmModule.forFeature([], 'nittan'),

        /* ============================================
           Snapshot module
           (Registers snapshot ENTITIES + exports service)
        ============================================ */
        LoanAssignmentSnapshotModule,

        /* ============================================
           Monthly Income CRUD
        ============================================ */
        LoanAssignmentMonthlyIncomeModule,
       LoanAssignmentMonthlyExpenseModule,
    ],

    controllers: [
        LoanReceivableAssignmentController,

        // Personal Snapshot Edit API
        PersonalSnapshotController,
    ],

    providers: [
        LoanReceivableAssignmentService,

        // Personal Snapshot Edit Service
        PersonalSnapshotEditService,
    ],

    exports: [
        LoanReceivableAssignmentService,
    ],
})
export class LoanReceivableAssignmentModule { }
