import { Module } from '@nestjs/common';
import { AccountRetentionService } from './account-retention.service';
import { AccountRetentionController } from './account-retention.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRetention } from './entities/account-retention.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountRetention], 'nittan_app'), // 👈 IMPORTANT
  ],
  controllers: [AccountRetentionController],
  providers: [AccountRetentionService],
  exports: [AccountRetentionService], // 👈 recommended for reuse by LoanAssignment
})
export class AccountRetentionModule {}
