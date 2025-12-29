import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { LoanAssignmentIdentification } from './loanassignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './loanassignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './loanassignment-contact-reference.entity';
import { LoanAssignmentAttachment } from './loanassignment-attachment.entity';

@Entity('LoanAssignment_PersonalSnapshot')
export class LoanAssignmentPersonalSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loanAssignmentId: number;

  @Column()
  borrowerId: number;

  @Column()
  personalInfoId: number;

  // ===== PERSONAL DATA =====
  @Column({ nullable: true }) lastName?: string;
  @Column({ nullable: true }) firstName?: string;
  @Column({ nullable: true }) middleName?: string;
  @Column({ nullable: true }) suffix?: string;
  @Column({ nullable: true }) title?: string;
  @Column({ nullable: true }) alias?: string;
  @Column({ type: 'date', nullable: true }) dateOfBirth?: Date;
  @Column({ nullable: true }) placeOfBirth?: string;
  @Column({ nullable: true }) gender?: string;
  @Column({ nullable: true }) numDependents?: number;
  @Column({ nullable: true }) civilStatus?: string;
  @Column({ nullable: true }) nationality?: string;
  @Column({ nullable: true }) motherMaidenName?: string;
  @Column({ nullable: true }) fatherName?: string;

  // ===== CONTACT DATA =====
  @Column({ nullable: true }) mobileNumber?: string;
  @Column({ nullable: true }) officeContactNumber?: string;
  @Column({ nullable: true }) homePhoneNumber?: string;
  @Column({ nullable: true }) emailAddress?: string;
  @Column({ nullable: true }) facebookAccount?: string;

  // ===== PRESENT ADDRESS =====
  @Column({ nullable: true }) presentAddress?: string;
  @Column({ nullable: true }) presentYearsOfStay?: number;
  @Column({ nullable: true }) presentOwnershipType?: string;

  // ===== PERMANENT ADDRESS =====
  @Column({ nullable: true }) permanentAddress?: string;
  @Column({ nullable: true }) permanentYearsOfStay?: number;
  @Column({ nullable: true }) permanentOwnershipType?: string;

  // ===== EMPLOYMENT =====
  @Column({ nullable: true }) employerName?: string;
  @Column({ nullable: true }) businessNature?: string;
  @Column({ nullable: true }) employmentAddress?: string;
  @Column({ nullable: true }) yearsOfService?: number;
  @Column({ nullable: true }) employerContactNumber?: string;
  @Column({ nullable: true }) employerEmail?: string;
  @Column({ nullable: true }) jobTitle?: string;

  // ===== SPOUSE =====
  @Column({ nullable: true }) spouseLastName?: string;
  @Column({ nullable: true }) spouseFirstName?: string;
  @Column({ nullable: true }) spouseMiddleName?: string;
  @Column({ nullable: true }) spouseNickName?: string;
  @Column({ type: 'date', nullable: true }) spouseDateOfBirth?: Date;
  @Column({ nullable: true }) spousePlaceOfBirth?: string;
  @Column({ nullable: true }) spouseMobileNumber?: string;
  @Column({ nullable: true }) spouseEmployerName?: string;
  @Column({ nullable: true }) spouseEmployerContact?: string;
  @Column({ nullable: true }) spouseJobTitle?: string;

  @CreateDateColumn()
  createdAt: Date;

  // ===== RELATIONS =====
  @OneToMany(() => LoanAssignmentIdentification, i => i.snapshot)
  identifications: LoanAssignmentIdentification[];

  @OneToMany(() => LoanAssignmentMonthlyIncome, i => i.snapshot)
  incomes: LoanAssignmentMonthlyIncome[];

  @OneToMany(() => LoanAssignmentMonthlyExpense, e => e.snapshot)
  expenses: LoanAssignmentMonthlyExpense[];

  @OneToMany(() => LoanAssignmentContactReference, r => r.snapshot)
  references: LoanAssignmentContactReference[];

  @OneToMany(() => LoanAssignmentAttachment, a => a.snapshot)
  attachments: LoanAssignmentAttachment[];
}
