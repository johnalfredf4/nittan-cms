import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanReceivableAssignmentV2 } from './entities/loanreceivable-assignment.entity';
import { RetentionRule } from './entities/retention-rule.entity';
import { LoanReceivableAssignmentV2Service } from './services/loanreceivable-assignment-v2.service';
import { LoanReceivableAssignmentV2Controller } from './controllers/loanreceivable-assignment-v2.controller';
import { NittanService } from './nittan/nittan.service';
import { AgentLoadService } from './engine/agent-load.service';
import { LoanReceivableAssignmentV2 } from './entities/loanreceivable-assignment-v2.entity';
import { RetentionRuleV2 } from './entities/retention-rule-v2.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanReceivableAssignmentV2, RetentionRule],
      'nittan_app',
    ),
  ],
  providers: [
    LoanReceivableAssignmentV2Service,
    NittanService,
    AgentLoadService,
  ],
  controllers: [LoanReceivableAssignmentV2Controller],
})
export class LoanReceivableAssignmentV2Module {}
