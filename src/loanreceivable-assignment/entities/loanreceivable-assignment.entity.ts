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
  ZERO = '0',
  ONE_TO_30 = '1-30',
  THIRTY_ONE_TO_60 = '31-60',
  SIXTY_ONE_TO_90 = '61-90',
  NINETY_ONE_TO_120 = '91-120',
  ONE_TWENTY_ONE_TO_150 = '121-150',
  ONE_FIFTY_ONE_TO_180 = '151-180',
  GREATER_THAN_180 = '>=181',
}

@Entity('LoanReceivable_Assignments')
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanReceivableId: number; // NEW FIELD

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'varchar', length: 100 })
  dpdCategory: string;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'varchar', length: 20 })
  status: string; // ACTIVE | PROCESSED | EXPIRED

  @Column({ type: 'int' })
  agentId: number; // Receiver

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
}
