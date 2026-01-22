import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetentionRulesController } from './retention-rules.controller';
import { RetentionRulesService } from './retention-rules.service';
import { LoanRetentionRule } from './entities/loan-retention-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanRetentionRule],
      'nittan_app',
    ),
  ],
  controllers: [RetentionRulesController],
  providers: [RetentionRulesService],
  exports: [RetentionRulesService],
})
export class RetentionRulesModule {}

