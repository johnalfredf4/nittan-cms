import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import ormconfig from './config/ormconfig';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
  rootPath: join(__dirname, '..', 'src', 'public'),
}),
    TypeOrmModule.forRoot(ormconfig),
    UsersModule,
    RolesModule,
    AuthModule,
  ],
})
@Module({
  imports: [...],
})
export class AppModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    await this.rolesService.seedDefaultRoles();
    console.log('✔ Roles Seeded');
  }
}
export class AppModule {}
