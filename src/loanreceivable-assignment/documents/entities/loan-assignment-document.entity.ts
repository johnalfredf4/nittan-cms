import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'Loan_Assignment_Documents' })
@Unique(['loanReceivableAssignmentId', 'documentRequirementId'])
export class LoanAssignmentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanReceivableAssignmentId: number;

  @Column()
  documentRequirementId: number;

  @Column({ length: 50, default: 'PENDING' })
  status: 'PENDING' | 'SUBMITTED';

  @Column({ type: 'datetime2', nullable: true })
  dateSubmitted: Date;

  @Column({ length: 512, nullable: true })
  originalFilename?: string;

  @Column({ length: 255, nullable: true })
  s3Bucket?: string;

  @Column({ length: 1024, nullable: true })
  s3Key?: string;

  @Column({ length: 200, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
