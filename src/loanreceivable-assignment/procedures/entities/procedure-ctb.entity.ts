import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('LoanAssignment_CTB')
export class LoanAssignmentCTB {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  procedureId: number;

  @Column()
  checkNumber: string;

  @Column()
  checkDate: Date;

  @Column()
  bankBranch: string;

  @Column('decimal')
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
