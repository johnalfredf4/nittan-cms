import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { LocationType } from '../types/location-type';
import { AccountClass } from '../types/account-class';

@Entity({ name: 'Loan_Assignments' })
@Index(['loanApplicationId', 'active'], { unique: true })
export class LoanAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'int' })
  agentId: number; // maps User_Accounts.id

  @Column({ type: 'varchar', length: 10 })
  locationType: LocationType; // 'HQ' | 'BRANCH'

  @Column({ type: 'int', nullable: true })
  branchId: number | null; // NULL means HQ

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'int' })
  dpd: number;

  @Column({ type: 'varchar', length: 50 })
  accountClass: AccountClass;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'bit', default: true })
  active: boolean;

  @Column({ type: 'int', nullable: true })
  previousAssignmentId: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
