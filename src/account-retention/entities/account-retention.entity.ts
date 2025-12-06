import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'account_retention' })
export class AccountRetention {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  accountClass: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  retentionDays: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
