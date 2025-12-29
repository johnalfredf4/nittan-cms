import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { LoanAssignmentIdentification } from './loanassignment-identification.entity';
import { LoanAssignmentMonthlyIncome } from './loanassignment-monthly-income.entity';
import { LoanAssignmentMonthlyExpense } from './loanassignment-monthly-expense.entity';
import { LoanAssignmentContactReference } from './loanassignment-contact-reference.entity';
import { LoanAssignmentAttachment } from './loanassignment-attachment.entity';

@Entity('LoanAssignment_PersonalSnapshots') // ✅ PLURAL
export class LoanAssignmentPersonalSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  loanAssignmentId: number;

  @Index()
  @Column()
  borrowerId: number;

  @Column()
  personalInfoId: number;

  /* =======================
     PERSONAL DATA
  ======================= */
  @Column({ type: 'varchar', length: 100, nullable: true }) lastName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) firstName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) middleName?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) suffix?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) title?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) alias?: string;

  @Column({ type: 'date', nullable: true }) dateOfBirth?: Date;
  @Column({ type: 'varchar', length: 150, nullable: true }) placeOfBirth?: string;
  @Column({ type: 'varchar', length: 20, nullable: true }) gender?: string;

  @Column({ type: 'int', nullable: true }) numDependents?: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) civilStatus?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) nationality?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) motherMaidenName?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) fatherName?: string;

  /* =======================
     CONTACT DATA
  ======================= */
  @Column({ type: 'varchar', length: 50, nullable: true }) mobileNumber?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) officeContactNumber?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) homePhoneNumber?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) emailAddress?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) facebookAccount?: string;

  /* =======================
     ADDRESSES
  ======================= */
  @Column({ type: 'varchar', length: 255, nullable: true }) presentAddress?: string;
  @Column({ type: 'int', nullable: true }) presentYearsOfStay?: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) presentOwnershipType?: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) permanentAddress?: string;
  @Column({ type: 'int', nullable: true }) permanentYearsOfStay?: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) permanentOwnershipType?: string;

  /* =======================
     EMPLOYMENT
  ======================= */
  @Column({ type: 'varchar', length: 150, nullable: true }) employerName?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) businessNature?: string;
  @Column({ type: 'varchar', length: 255, nullable: true }) employmentAddress?: string;
  @Column({ type: 'int', nullable: true }) yearsOfService?: number;
  @Column({ type: 'varchar', length: 50, nullable: true }) employerContactNumber?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) employerEmail?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) jobTitle?: string;

  /* =======================
     SPOUSE
  ======================= */
  @Column({ type: 'varchar', length: 100, nullable: true }) spouseLastName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) spouseFirstName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) spouseMiddleName?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) spouseNickName?: string;
  @Column({ type: 'date', nullable: true }) spouseDateOfBirth?: Date;
  @Column({ type: 'varchar', length: 150, nullable: true }) spousePlaceOfBirth?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) spouseMobileNumber?: string;
  @Column({ type: 'varchar', length: 150, nullable: true }) spouseEmployerName?: string;
  @Column({ type: 'varchar', length: 50, nullable: true }) spouseEmployerContact?: string;
  @Column({ type: 'varchar', length: 100, nullable: true }) spouseJobTitle?: string;

  /* =======================
     TIMESTAMPS
  ======================= */
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /* =======================
     RELATIONS
  ======================= */
  @OneToMany(() => LoanAssignmentIdentification, i => i.snapshot, { cascade: true })
  identifications: LoanAssignmentIdentification[];

  @OneToMany(() => LoanAssignmentMonthlyIncome, i => i.snapshot, { cascade: true })
  incomes: LoanAssignmentMonthlyIncome[];

  @OneToMany(() => LoanAssignmentMonthlyExpense, e => e.snapshot, { cascade: true })
  expenses: LoanAssignmentMonthlyExpense[];

  @OneToMany(() => LoanAssignmentContactReference, r => r.snapshot, { cascade: true })
  references: LoanAssignmentContactReference[];

  @OneToMany(() => LoanAssignmentAttachment, a => a.snapshot, { cascade: true })
  attachments: LoanAssignmentAttachment[];
}
