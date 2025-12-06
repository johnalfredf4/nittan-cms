import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { DispositionCategory } from './disposition-category.entity';

@Entity({ name: 'dispositions' })
export class Disposition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => DispositionCategory, c => c.dispositions, { onDelete: 'CASCADE' })
  category: DispositionCategory;

  @Column()
  dispositionName: string;

  @Column({ default: false })
  requiresNextSchedule: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
