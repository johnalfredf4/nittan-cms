import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';

import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';
import { AuthModule } from './auth/auth.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { SmsTemplatesModule } from './sms-templates/sms-templates.module';
import { ProductTypesModule } from './product-types/product-types.module';
import { AccountRetentionModule } from './account-retention/account-retention.module';
import { DispositionsModule } from './dispositions/dispositions.module';
import { LoanAssignmentModule } from './loan-assignment/loan-assignment.module';
import ormconfig from './config/ormconfig';

// 👉 Entities belonging to the writable DB (nittan_app)
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { EmailTemplate } from './email-templates/entities/email-template.entity';
import { EmailTemplateVersion } from './email-templates/entities/email-template-version.entity';
import { SmsTemplate } from './sms-templates/entities/sms-template.entity';
import { ProductType } from './product-types/entities/product-type.entity';
import { AccountRetention } from './account-retention/entities/account-retention.entity';
import { DispositionCategory } from './dispositions/entities/disposition-category.entity';
import { Disposition } from './dispositions/entities/disposition.entity';
import { LoanAssignment } from './loan-assignment/entities/loan-assignment.entity';
import { RotationState } from './loan-assignment/entities/rotation-state.entity';
import { LoanReceivableAssignment } from './loanreceivable-assignment/entities/loanreceivable-assignment.entity';

// NEW MODULE
import { LoanReceivableAssignmentModule } from './loanreceivable-assignment/loanreceivable-assignment.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { EmailSenderModule } from './email-sender/email-sender.module';
import { SmsSenderModule } from './sms-sender/sms-sender.module';
import { CoBorrowerModule } from './coborrower/coborrower.module';
import { PaymentHistoryModule } from './paymenthistory/paymenthistory.module';
import { EmailSendLog } from './email-sender/entities/email-send-log.entity';
import { SmsSendLog } from './sms-sender/entities/sms-send-log.entity';

// SNAPSHOT ENTITIES (ADD THESE)
import { LoanAssignmentPersonalSnapshot } from './loanreceivable-assignment/snapshot/entities/loanassignment-personal-snapshot.entity';
import { LoanAssignmentIdentification } from './loanreceivable-assignment/snapshot/entities/loanassignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './loanreceivable-assignment/snapshot/entities/loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './loanreceivable-assignment/snapshot/entities/loanassignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './loanreceivable-assignment/snapshot/entities/loanassignment-contact-reference.entity';


@Module({
  imports: [
    ScheduleModule.forRoot(),

    // DEFAULT DB connection (CMS DB)
    TypeOrmModule.forRoot(ormconfig),

    // Writable DB connection
    TypeOrmModule.forRoot({
      name: 'nittan_app',
      type: 'mssql',
      host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
      port: 1433,
      username: 'bong3',
      password: 'bong3',
      database: 'Nittan-App',
      synchronize: false,
      autoLoadEntities: false,
      entities: [
        User,
        Role,
        EmailTemplate,
        EmailTemplateVersion,
        SmsTemplate,
        ProductType,
        AccountRetention,
        DispositionCategory,
        Disposition,
        LoanAssignment,
        RotationState,
        LoanReceivableAssignment,
        // 🔥 SNAPSHOT ENTITIES (THIS FIXES THE ERROR)
        LoanAssignmentPersonalSnapshot,
        LoanAssignmentIdentification,
        LoanAssignmentMonthlyIncome,
        LoanAssignmentMonthlyExpense,
        LoanAssignmentContactReference,
        EmailSendLog,
        SmsSendLog,
      ],
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 600000,
      },
    }),

    // Reporting/raw connection (no entities)
    TypeOrmModule.forRoot({
      name: 'nittan',
      type: 'mssql',
      host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
      port: 1433,
      username: 'bong3',
      password: 'bong3',
      database: 'Nittan',
      synchronize: false,
      autoLoadEntities: false,
      entities: [],
      options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 600000,
      },
    }),

    UsersModule,
    RolesModule,
    AuthModule,
    EmailTemplatesModule,
    SmsTemplatesModule,
    ProductTypesModule,
    AccountRetentionModule,
    DispositionsModule,
    LoanReceivableAssignmentModule, // 👈 Register NEW MODULE
    AssignmentsModule,
    EmailSenderModule,
    SmsSenderModule,
    CoBorrowerModule,
    PaymentHistoryModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'src', 'public'),
    }),
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.seedDefaultRoles();
    console.log('✔ Roles Seeded');
  }
}
