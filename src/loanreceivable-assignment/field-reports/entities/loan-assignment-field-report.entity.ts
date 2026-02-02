import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LoanAssignment_FieldReports')
export class LoanAssignmentFieldReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanAssignmentId: number;

  @Column('nvarchar', { length: 'max' })
  remarks: string;

  @Column()
  skipTraceResult: string; // POSITIVE | NEGATIVE | UNDETERMINED

  @Column({ default: false })
  isSubjectForSkip: boolean;

  @Column()
  createdByAgentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
