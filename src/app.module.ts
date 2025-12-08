import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

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

@Module({
  imports: [
     // DEFAULT DATABASE (CMS writable DB)
    TypeOrmModule.forRoot(ormconfig),
    // MAIN connection -> all repositories use this automatically
    TypeOrmModule.forRoot({
      name: 'nittan_app', // MUST MATCH injection usage
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
      ],
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),

    // SECOND connection → raw SQL queries, NO models
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
      entities: [], // must stay empty
      options: {
        encrypt: false,
        trustServerCertificate: true,
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
    LoanAssignmentModule,

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
