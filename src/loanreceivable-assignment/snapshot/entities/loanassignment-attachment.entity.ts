import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_Attachments')
export class LoanAssignmentAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => LoanAssignmentPersonalSnapshot,
    snapshot => snapshot.attachments,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'personalSnapshotId' }) // 👈 MUST match DB column
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column({ length: 50 })
  attachmentType: string;

  @Column({ length: 255 })
  filePath: string;

  @CreateDateColumn({ type: 'datetime' })
  uploadedAt: Date;
}
