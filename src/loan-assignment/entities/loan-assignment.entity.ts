import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum LocationType {
  HQ = 'HQ',
  BRANCH = 'BRANCH',
}

export enum AccountClass {
  DPD_0 = 'DPD_0',
  DPD_1_30 = 'DPD_1_30',
  DPD_31_60 = 'DPD_31_60',
  DPD_61_90 = 'DPD_61_90',
  DPD_91_120 = 'DPD_91_120',
  DPD_121_150 = 'DPD_121_150',
  DPD_151_180 = 'DPD_151_180',
  DPD_181_PLUS = 'DPD_181_PLUS',
}

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
  locationType: 'HQ' | 'BRANCH';


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
