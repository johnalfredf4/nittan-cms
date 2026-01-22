import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentWorkloadController } from './agent-workload.controller';
import { AgentWorkloadService } from './agent-workload.service';
import { LoanReceivableAssignment } from '../entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from '../loanreceivable-assignment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanReceivableAssignment],
      'nittan_app',
    ),
  ],
  controllers: [AgentWorkloadController],
  providers: [
    AgentWorkloadService,
    LoanReceivableAssignmentService,
  ],
})
export class AgentWorkloadModule {}
