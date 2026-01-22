import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LoanRetentionRules')
export class LoanRetentionRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  categoryCode: string;

  @Column()
  dpdMin: number;

  @Column()
  dpdMax: number;

  @Column()
  retentionDays: number;

  @Column({ length: 100 })
  label: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
