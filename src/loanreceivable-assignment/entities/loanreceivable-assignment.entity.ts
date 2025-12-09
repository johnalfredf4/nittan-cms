import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

export enum DpdCategory {
  DPD_0 = '0',
  DPD_1_30 = '1-30',
  DPD_31_60 = '31-60',
  DPD_61_90 = '61-90',
  DPD_91_120 = '91-120',
  DPD_121_150 = '121-150',
  DPD_151_180 = '151-180',
  DPD_181_PLUS = '>=181',
}

export enum AccountClass {
  CLASS_A = 'A',
  CLASS_B = 'B',
  CLASS_C = 'C',
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  PROCESSED = 'PROCESSED',
  EXPIRED = 'EXPIRED',
}


@Entity('LoanReceivable_Assignments')
export class LoanReceivableAssignment {
  import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

export enum DpdCategory {
  DPD_0 = '0',
  DPD_1_30 = '1-30',
  DPD_31_60 = '31-60',
  DPD_61_90 = '61-90',
  DPD_91_120 = '91-120',
  DPD_121_150 = '121-150',
  DPD_151_180 = '151-180',
  DPD_181_PLUS = '>=181',
}

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  PROCESSED = 'PROCESSED',
  EXPIRED = 'EXPIRED'
}

export enum AccountClass {
  REGULAR = 'REGULAR',
  SPECIAL = 'SPECIAL'
}

@Entity('LoanReceivableAssignments')
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })  
  loanApplicationId: number;

  @Column({ type: 'bigint' })
  loanReceivableId: number;

  @Column({ type: 'bigint' })
  agentId: number;

  @Column({ type: 'int', nullable: true })  
  branchId: number | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'HQ'
  })
  locationType: string;

  @Column({ type: 'int' })
  dpd: number;

  @Column({
    type: 'varchar',
    length: 20
  })
  dpdCategory: DpdCategory;

  @Column({ type: 'int' })
  retentionDays: number;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: AccountClass.REGULAR
  })
  accountClass: AccountClass;

  @Column({
    type: 'varchar',
    length: 20,
    default: AssignmentStatus.ACTIVE
  })
  status: AssignmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

    
}
