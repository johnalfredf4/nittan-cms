import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LoanAssignmentPersonalSnapshot } from './loanassignment-personal-snapshot.entity';

@Entity('LoanAssignment_Identifications')
export class LoanAssignmentIdentification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, s => s.identifications)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  idType: string;

  @Column()
  idNumber: string;

  @Column({ type: 'date', nullable: true })
  dateIssued?: Date;

  @Column({ nullable: true })
  countryIssued?: string;
}
