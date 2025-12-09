import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccountClass {
  STANDARD = 'STANDARD',
  PRIORITY = 'PRIORITY',
  VIP = 'VIP',
}

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

@Entity('LoanReceivable_Assignments')
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanReceivableId: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({
    type: 'enum',
    enum: DpdCategory,
  })
  dpdCategory: DpdCategory;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'varchar', length: 20 })
  status: string; // ACTIVE | PROCESSED | EXPIRED

  @Column({ type: 'int' })
  agentId: number;

  @Column({
    type: 'enum',
    enum: AccountClass,
    default: AccountClass.STANDARD,
  })
  accountClass: AccountClass;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;

  @Column({
  type: 'varchar',
  length: 20,
  })
  dpdCategory: DpdCategory;

}
