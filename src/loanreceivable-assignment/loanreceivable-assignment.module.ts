import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanreceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanreceivableAssignmentController } from './loanreceivable-assignment.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature(
      [LoanReceivableAssignment],
      'nittan_app',
    ),
  ],
  controllers: [LoanreceivableAssignmentController],
  providers: [LoanreceivableAssignmentService],
  exports: [LoanreceivableAssignmentService],
})
export class LoanreceivableAssignmentModule {}
