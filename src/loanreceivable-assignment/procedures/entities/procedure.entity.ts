import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LoanAssignment_Procedures')
export class LoanAssignmentProcedure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanAssignmentId: number;

  @Column({ nullable: true })
  complaintAffidavitDate: Date;

  @Column({ nullable: true })
  subscriptionDate: Date;

  @Column({ nullable: true })
  mediationStatus: string;

  @Column({ nullable: true })
  docketPaymentDate: Date;

  @Column('decimal', { nullable: true })
  docketPaymentAmount: number;

  @Column({ nullable: true })
  hearingSchedule: Date;

  @Column({ nullable: true })
  caseStatus: string;

  @Column({ nullable: true })
  activeCaseStatus: string;

  @Column()
  createdByAgentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
