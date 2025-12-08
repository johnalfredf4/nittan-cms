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
  loanApplicationId: number;  // from Nittan.tblLoanApplications (Id INT)

  @Column({ type: 'int' })
  agentId: number;            // from Nittan_App.dbo.User_Accounts (id INT)

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'varchar', length: 10 })
  locationType: LocationType; // 'HQ' | 'BRANCH'

  @Column({ type: 'varchar', length: 50 })
  accountClass: AccountClass; // stored as string

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'bit', default: true })
  active: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;
}
