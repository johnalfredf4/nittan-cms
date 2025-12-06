import { Module } from '@nestjs/common';
import { AccountRetentionService } from './account-retention.service';
import { AccountRetentionController } from './account-retention.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRetention } from './entities/account-retention.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountRetention])],
  controllers: [AccountRetentionController],
  providers: [AccountRetentionService],
})
export class AccountRetentionModule {}
