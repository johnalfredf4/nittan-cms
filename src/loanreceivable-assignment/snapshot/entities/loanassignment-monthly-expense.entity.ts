import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_MonthlyExpenses')
export class LoanAssignmentMonthlyExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, snapshot => snapshot.expenses)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  expenseType: string;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  creditor?: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  creditAmount?: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  outstandingBalance?: number;
}
