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

  @ManyToOne(() => LoanReceivableAssignment)
  @JoinColumn({ name: 'LoanReceivableAssignmentId' })
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

  @Column({ name: 'S3Url' })
  s3Url: string;

  //@Column()
  //txtFileName: string;

  // 🔽 NEW FIELDS
  @Column({ nullable: true })
  contactedParty?: string;

  @Column({ type: 'int', nullable: true })
  dispositionId?: number;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  remarks?: string;

  @Column({ type: 'datetime', nullable: true })
  nextCallScheduleAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}




