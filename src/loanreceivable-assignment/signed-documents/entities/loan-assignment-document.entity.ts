import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LoanAssignment_Documents')
export class LoanAssignmentDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanAssignmentId: number;

  @Column()
  documentName: string;

  @Column()
  documentType: string;

  @Column()
  status: string; // SIGNED | PENDING

  @Column()
  s3Key: string;

  @Column({ nullable: true })
  signedAt: Date;

  @Column()
  uploadedByAgentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
