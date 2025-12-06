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

@Module({
  imports: [
    TypeOrmModule.forRoot(ormconfig),
    UsersModule,
    RolesModule,
    AuthModule,
    EmailTemplatesModule,
    SmsTemplatesModule,
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
