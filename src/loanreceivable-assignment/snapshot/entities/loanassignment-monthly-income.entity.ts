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

  @ManyToOne(
    () => PersonalSnapshotId,
    snapshot => snapshot.incomes,
    { onDelete: 'CASCADE' },
  )
  snapshot: PersonalSnapshotId;

  // ✅ MSSQL-safe: store enum as VARCHAR
  @Column({
    type: 'varchar',
    length: 20,
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
