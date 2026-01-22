import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AgentWorkloadController } from './agent-workload.controller';
import { AgentWorkloadService } from './agent-workload.service';
import { LoanReceivableAssignment } from '../entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentModule } from '../loanreceivable-assignment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanReceivableAssignment],
      'nittan_app',
    ),
    LoanReceivableAssignmentModule, // ✅ IMPORT MODULE
  ],
  controllers: [AgentWorkloadController],
  providers: [AgentWorkloadService],
})
export class AgentWorkloadModule {}
