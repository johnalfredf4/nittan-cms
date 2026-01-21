import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { DpdCategory } from './loanreceivable-assignment-v2.entity';

@Entity('LoanReceivable_RetentionRules_V2')
export class RetentionRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    unique: true,
  })
  category: DpdCategory;

  @Column({
    type: 'int',
    nullable: true,
  })
  retentionDays: number | null; // NULL = indefinite

  @Column({
    type: 'varchar',
    length: 100,
  })
  label: string;

  @Column({
    type: 'bit',
    default: 1,
  })
  active: boolean;
}
