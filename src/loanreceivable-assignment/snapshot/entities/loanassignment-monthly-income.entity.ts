import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_MonthlyIncome')
export class LoanAssignmentMonthlyIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => LoanAssignmentPersonalSnapshot,
    snapshot => snapshot.incomes,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'personalSnapshotId' }) // 👈 MUST match DB column
  snapshot: LoanAssignmentPersonalSnapshot;

  // MSSQL-safe enum
  @Column({
    type: 'varchar',
    length: 20,
  })
  incomeType: 'Applicant' | 'Spouse';

  // 🔴 CHANGED FROM DECIMAL → VARCHAR
  @Column({
    type: 'varchar',
    length: 100,
  })
  amount: string;

  @Column({ length: 150, nullable: true })
  bankName?: string;

  @Column({ length: 150, nullable: true })
  bankBranch?: string;

  @Column({ length: 50, nullable: true })
  accountNumber?: string;
}
