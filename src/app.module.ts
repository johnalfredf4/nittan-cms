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
import { SmsTemplate } from './sms-templates/entities/sms-template.entity';
import { ProductTypesModule } from './product-types/product-types.module';
import { AccountRetentionModule } from './account-retention/account-retention.module';
import { DispositionsModule } from './dispositions/dispositions.module';
import { LoanAssignmentModule } from './loan-assignment/loan-assignment.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
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
