import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAssignmentMonthlyIncome } from '../snapshot/entities/loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyIncomeService } from './loanassignment-monthly-income.service';
import { LoanAssignmentMonthlyIncomeController } from './loanassignment-monthly-income.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature(
            [LoanAssignmentMonthlyIncome],
            'nittan_app',
        ),
    ],
    controllers: [LoanAssignmentMonthlyIncomeController],
    providers: [LoanAssignmentMonthlyIncomeService],
})
export class LoanAssignmentMonthlyIncomeModule { }
