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
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanApplicationId: string;

  @Column()
  loanReceivableId: number;

  @Column()
  agentId: number;

  @Column()
  branchId: number;

  @Column()
  locationType: string;

  @Column()
  dpd: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  dpdCategory: DpdCategory;

  @Column()
  retentionDays: number;

  @Column()
  retentionUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
  type: 'varchar',
  length: 20,
  default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

    
}
