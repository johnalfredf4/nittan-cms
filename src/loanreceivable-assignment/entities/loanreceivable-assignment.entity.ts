import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum AccountClass {
  CURRENT = 'CURRENT',
  AGING_1_30 = 'AGING_1_30',
  AGING_31_60 = 'AGING_31_60',
  AGING_61_90 = 'AGING_61_90',
  AGING_91_120 = 'AGING_91_120',
  AGING_121_150 = 'AGING_121_150',
  AGING_151_180 = 'AGING_151_180',
  AGING_181_PLUS = 'AGING_181_PLUS',
}

@Entity('LoanReceivable_Assignments')
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanReceivableId: number;

  @Column({ type: 'int' })
  agentId: number;

  /**  
   * Calculated automatically based on DueDate  
   */
  @Column({ type: 'int' })
  dpd: number;

  /**
   * Categorized based on DPD
   */
  @Column({
    type: 'varchar',
    length: 20,
  })
  accountClass: AccountClass;

  /**
   * Retention logic in days:
   * 0 - 180 DPD → 7 days
   * 181+ → 120 days
   */
  @Column({ type: 'int' })
  retentionDays: number;

  /**
   * After retention days expires, this record is reallocatable
   */
  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'bit', default: 0 })
  processed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
