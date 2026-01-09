// entities/loanassignment-call-recording.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { LoanReceivableAssignment } from '../../entities/loanreceivable-assignment.entity';

@Entity('LoanAssignment_CallRecordings')
export class LoanAssignmentCallRecording {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanReceivableAssignment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'LoanAssignmentId' })
  loanAssignment: LoanReceivableAssignment;

  @Column()
  borrowerName: string;

  @Column({ nullable: true })
  callerNumber?: string;

  @Column({ nullable: true })
  calleeNumber?: string;

  @Column({ type: 'datetime', nullable: true })
  callStartTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  callEndTime?: Date;

  @Column({ nullable: true })
  durationSeconds?: number;

  @Column()
  recordingS3Url: string;

  @Column()
  txtFileName: string;

  @CreateDateColumn()
  createdAt: Date;
}
