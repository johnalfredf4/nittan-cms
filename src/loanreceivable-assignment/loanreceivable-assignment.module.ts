import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanReceivableAssignment } from './entities/loanreceivable-assignment.entity';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { LoanReceivableAssignmentController } from './loanreceivable-assignment.controller';

@Module({
  imports: [
    // Repositories belong to writable DB
    TypeOrmModule.forFeature([LoanReceivableAssignment], 'nittan_app'),

    // Must import second connection so service can inject DataSource
    TypeOrmModule.forFeature([], 'nittan'),
  ],
  controllers: [LoanReceivableAssignmentController],
  providers: [LoanReceivableAssignmentService],
  exports: [LoanReceivableAssignmentService],
})
export class LoanReceivableAssignmentModule {}
