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
  @PrimaryGeneratedColumn({ name: 'Id' })
  id: number;

  @ManyToOne(() => LoanReceivableAssignment)
  @JoinColumn({ name: 'LoanReceivableAssignmentId' })
  loanAssignment: LoanReceivableAssignment;

  @Column({ name: 'AgentId' })
  agentId: number;

  @Column({ name: 'ClientName' })
  clientName: string;

  @Column({ name: 'MobileNumber' })
  mobileNumber: string;

  @Column({ name: 'FileName' })
  fileName: string;

  @Column({ name: 'S3Key' })
  s3Key: string;

  @Column({ name: 'S3Url' })
  s3Url: string;

  @Column({ name: 'CallStartedAt', type: 'datetime', nullable: true })
  callStartedAt?: Date;

  @Column({ name: 'CallEndedAt', type: 'datetime', nullable: true })
  callEndedAt?: Date;

  @Column({ name: 'DurationSeconds', nullable: true })
  durationSeconds?: number;

  @Column({ name: 'ContactedParty', nullable: true })
  contactedParty?: string;

  @Column({ name: 'DispositionId', type: 'int', nullable: true })
  dispositionId?: number;

  @Column({ name: 'Remarks', type: 'nvarchar', length: 'max', nullable: true })
  remarks?: string;

  @Column({ name: 'NextCallScheduleAt', type: 'datetime', nullable: true })
  nextCallScheduleAt?: Date;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt: Date;
}





