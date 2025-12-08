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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  loanApplicationId: number;

  @Column()
  agentId: number; // maps User_Accounts.id

  @Column({
    type: 'varchar',
    length: 10,
  })
  locationType: LocationType;

  @Column({ nullable: true })
  branchId: number | null;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'int' })
  dpd: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  accountClass: AccountClass;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  previousAssignmentId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
