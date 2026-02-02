import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('LoanAssignment_ProcedureDocuments')
export class LoanAssignmentProcedureDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  procedureId: number;

  @Column()
  documentType: string;

  @Column()
  documentName: string;

  @Column()
  s3Key: string;

  @Column()
  uploadedByAgentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
