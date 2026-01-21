import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LoanRetentionRules')
export class RetentionRuleV2 {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  categoryCode: string; // CAT1 ... CAT8

  @Column({ type: 'int' })
  dpdMin: number;

  @Column({ type: 'int', nullable: true })
  dpdMax: number | null;

  @Column({ type: 'int', nullable: true })
  retentionDays: number | null; // null = indefinite

  @Column({ type: 'varchar', length: 100 })
  label: string;

  @Column({ type: 'bit', default: 1 })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
