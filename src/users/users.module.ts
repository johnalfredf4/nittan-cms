import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Branch } from '../branches/entities/branch.entity';
import { BranchesModule } from '../branches/branches.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Branch], 'nittan_app'),
    BranchesModule, // ✅ modules go here, not in forFeature
    HttpModule, // ✅ ADD
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
