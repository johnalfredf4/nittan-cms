import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_ContactReferences')
export class LoanAssignmentContactReference {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, snapshot => snapshot.references)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  referenceName: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  contactNumber?: string;

  @Column({ nullable: true })
  employer?: string;
}
