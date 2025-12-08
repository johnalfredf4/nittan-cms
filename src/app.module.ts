import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import ormconfig from './config/ormconfig';
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

@Module({
  imports: [
    // ✅ Default CMS DB (Nittan_App) – used by User, Roles, etc.
    TypeOrmModule.forRoot(ormconfig),

    // ✅ Second connection: Nittan (loan schedules) – named
    TypeOrmModule.forRoot({
      name: 'nittan',
      type: 'mssql',
      host: process.env.NITTAN_DB_HOST || 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
      port: Number(process.env.NITTAN_DB_PORT) || 1433,
      username: process.env.NITTAN_DB_USER || 'bong3',
      password: process.env.NITTAN_DB_PWD || 'bong3',
      database: 'Nittan',
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
      // no entities needed if you're just doing raw queries
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
