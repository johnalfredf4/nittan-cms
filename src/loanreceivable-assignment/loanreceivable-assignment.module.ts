import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LoanReceivableAssignment], 'nittan_app')],
  controllers: [LoanReceivableAssignmentController],
  providers: [LoanReceivableAssignmentService],
  exports: [LoanReceivableAssignmentService],
})
export class LoanReceivableAssignmentModule {}
