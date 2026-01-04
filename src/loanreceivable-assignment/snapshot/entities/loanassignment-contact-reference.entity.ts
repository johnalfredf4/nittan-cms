import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_ContactReferences')
export class LoanAssignmentContactReference {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => LoanAssignmentPersonalSnapshot,
    snapshot => snapshot.references,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'personalSnapshotId' }) // 👈 must match DB column
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column({ length: 150 })
  referenceName: string;

  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 50, nullable: true })
  contactNumber?: string;

  @Column({ length: 150, nullable: true })
  employer?: string;

  /* ============================
     NEW COLUMNS
  ============================ */

  @Column({
    type: 'nvarchar',
    length: 50,
    default: 'Relatives',
  })
  section: string;

  @Column({
    type: 'nvarchar',
    length: 100,
    nullable: true,
  })
  relationship?: string;
  
}
