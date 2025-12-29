import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_Identifications')
export class LoanAssignmentIdentification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => LoanAssignmentPersonalSnapshot,
    snapshot => snapshot.identifications,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'personalSnapshotId' }) // 👈 must exist in DB
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column({ length: 50 })
  idType: string;

  @Column({ length: 100 })
  idNumber: string;

  @Column({ type: 'date', nullable: true })
  dateIssued?: Date;

  @Column({ length: 100, nullable: true })
  countryIssued?: string;
}
