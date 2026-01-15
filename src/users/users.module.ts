import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { BranchesModule } from '../branches/branches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, BranchesModule], 'nittan_app'),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // optional but recommended
})
export class UsersModule {}
