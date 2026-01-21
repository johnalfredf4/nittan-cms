import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AssignmentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

@Entity('LoanReceivable_Assignments_V2')
export class LoanReceivableAssignmentV2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanReceivableId: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'int' })
  dpd: number;

  // 🔥 STORE CATEGORY CODE (CAT1–CAT8)
  @Column({ type: 'varchar', length: 10 })
  dpdCategory: string;

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

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
