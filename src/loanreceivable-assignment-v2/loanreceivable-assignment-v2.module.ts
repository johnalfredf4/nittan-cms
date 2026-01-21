import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanReceivableAssignmentV2Service } from './services/loanreceivable-assignment-v2.service';
import { LoanReceivableAssignmentV2Controller } from './controllers/loanreceivable-assignment-v2.controller';

import { LoanReceivableAssignmentV2 } from './entities/loanreceivable-assignment-v2.entity';
import { RetentionRuleV2 } from './entities/retention-rule-v2.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanReceivableAssignmentV2, RetentionRuleV2],
      'nittan_app',
    ),
  ],
  controllers: [LoanReceivableAssignmentV2Controller],
  providers: [LoanReceivableAssignmentV2Service],
})
export class LoanReceivableAssignmentV2Module {}
