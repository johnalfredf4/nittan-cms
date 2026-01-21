import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PROCESSED = 'PROCESSED',
}

export enum DpdCategory {
  CAT1 = 'CAT1',
  CAT2 = 'CAT2',
  CAT3 = 'CAT3',
  CAT4 = 'CAT4',
  CAT5 = 'CAT5',
  CAT6 = 'CAT6',
  CAT7 = 'CAT7',
  CAT8 = 'CAT8',
}

@Entity('LoanReceivable_Assignments_V2')
export class LoanReceivableAssignmentV2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'int' })
  loanReceivableId: number;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'int', nullable: true })
  dpd: number;

  @Column({ type: 'varchar', length: 10 })
  dpdCategory: DpdCategory;

  @Column({ type: 'int', nullable: true })
  retentionDays: number | null;

  @Column({ type: 'datetime', nullable: true })
  retentionUntil: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
