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
import { LoanAssignmentIdentificationModule } from './identifications/loanassignment-identification.module';
import { LoanAssignmentContactReferenceModule } from './contact-references/loanassignment-contact-reference.module';
import { LoanAssignmentAttachmentModule } from './attachments/loanassignment-attachment.module';

import { DocumentsModule } from './documents/documents.module';
import { LoanAssignmentDocument } from './documents/entities/loan-assignment-document.entity';
import { DocumentRequirement } from './documents/entities/document-requirement.entity';

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
       LoanAssignmentIdentificationModule,
       LoanAssignmentContactReferenceModule,
       LoanAssignmentAttachmentModule,
       LoanAssignmentDocument, 
       DocumentRequirement,
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
