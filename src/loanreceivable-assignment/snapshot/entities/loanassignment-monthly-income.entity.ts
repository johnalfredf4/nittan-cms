import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_MonthlyIncome')
export class LoanAssignmentMonthlyIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, snapshot => snapshot.incomes)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column({
    type: 'enum',
    enum: ['Applicant', 'Spouse'],
  })
  incomeType: 'Applicant' | 'Spouse';

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  bankName?: string;

  @Column({ nullable: true })
  bankBranch?: string;

  @Column({ nullable: true })
  accountNumber?: string;
}
