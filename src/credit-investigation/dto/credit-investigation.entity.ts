import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('CreditInvestigationReports')
export class CreditInvestigationReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanCode: string;

  @Column('decimal', { nullable: true })
  loanAmount: number;

  @Column({ nullable: true })
  monthlyTerm: number;

  @Column('decimal', { nullable: true })
  monthlyAmortization: number;

  @Column({ nullable: true })
  reportStatus: string;

  @Column('nvarchar', { length: 'max', nullable: true })
  ciRemarks: string;

  @Column()
  borrowerName: string;

  @Column({ nullable: true })
  borrowerContact: string;

  @Column({ nullable: true })
  borrowerEmail: string;

  @Column({ nullable: true })
  borrowerAgency: string;

  @Column({ nullable: true })
  borrowerEmployer: string;

  @Column({ nullable: true })
  borrowerEmploymentStatus: string;

  @Column({ nullable: true })
  borrowerPosition: string;

  @Column({ nullable: true })
  borrowerConfirmingOfficer: string;

  @Column('nvarchar', { length: 'max', nullable: true })
  additionalCiRemarks: string;

  @Column('nvarchar', { length: 'max', nullable: true })
  ocularReport: string;

  @Column({ nullable: true })
  ciReportBy: string;

  @Column({ nullable: true })
  ocularReportBy: string;

  @Column({ nullable: true })
  checkedAndPreApprovedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column('nvarchar', { length: 'max', nullable: true })
  ndiComputation: string;

  @Column()
  createdByUserId: number;

  @Column()
  createdByRole: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
