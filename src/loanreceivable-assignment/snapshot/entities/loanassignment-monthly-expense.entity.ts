import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_MonthlyExpenses')
export class LoanAssignmentMonthlyExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => LoanAssignmentPersonalSnapshot,
    snapshot => snapshot.expenses,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'personalSnapshotId' }) // 👈 MUST MATCH DB COLUMN
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column({ length: 100 })
  expenseType: string;

  // 🔴 CHANGED FROM DECIMAL → VARCHAR
  @Column({
    type: 'varchar',
    length: 100,
  })
  amount: string;

  @Column({ length: 150, nullable: true })
  creditor?: string;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  creditAmount?: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  outstandingBalance?: number;
}
