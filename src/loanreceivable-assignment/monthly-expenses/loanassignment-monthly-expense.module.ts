import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAssignmentMonthlyExpense } from '../snapshot/entities/loanassignment-monthly-expense.entity';
import { LoanAssignmentMonthlyExpenseService } from './loanassignment-monthly-expense.service';
import { LoanAssignmentMonthlyExpenseController } from './loanassignment-monthly-expense.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentMonthlyExpense],
      'nittan_app',
    ),
  ],
  controllers: [LoanAssignmentMonthlyExpenseController],
  providers: [LoanAssignmentMonthlyExpenseService],
})
export class LoanAssignmentMonthlyExpenseModule {}
