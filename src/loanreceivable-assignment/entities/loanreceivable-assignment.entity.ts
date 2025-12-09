import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { LocationType, DpdCategory } from '../types';

@Entity({ name: 'LoanReceivable_Assignments' })
export class LoanReceivableAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  loanApplicationId: number;

  @Column({ type: 'int', nullable: true })
  loanReceivableId: number | null;

  @Column({ type: 'int' })
  agentId: number;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'varchar', length: 10 })
  locationType: LocationType;

  @Column({ type: 'int' })
  dpd: number;

  @Column({ type: 'varchar', length: 30 })
  dpdCategory: DpdCategory;

  @Column({ type: 'int' })
  retentionDays: number;

  @Column({ type: 'datetime' })
  retentionUntil: Date;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string; // ACTIVE | PROCESSED | EXPIRED

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  updatedAt: Date;
}
