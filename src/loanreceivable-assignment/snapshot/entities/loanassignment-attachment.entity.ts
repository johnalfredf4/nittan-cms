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

  @ManyToOne(() => PersonalSnapshotId, snapshot => snapshot.attachments)
  snapshot: PersonalSnapshotId;

  @Column()
  attachmentType: string;

  @Column()
  filePath: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
