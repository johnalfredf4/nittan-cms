import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('Loan_Assignments')
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanReceivableId: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'varchar', length: 10 })
  dpdCategory: string;

  @Column({ type: 'varchar', length: 10 })
  status: string;

  @Column({ type: 'varchar', length: 10 })
  locationType: string;

  @Column({ type: 'int', default: 7 })
  retentionDays: number;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
