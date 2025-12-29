import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_Attachments')
export class LoanAssignmentAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, snapshot => snapshot.attachments)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  attachmentType: string;

  @Column()
  filePath: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
