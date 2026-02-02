import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('CreditInvestigation_CoBorrowers')
export class CreditInvestigationCoBorrower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creditInvestigationReportId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  contactNumber: string;

  @Column({ nullable: true })
  relationship: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  employer: string;

  @Column({ nullable: true })
  employmentStatus: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  confirmingOfficer: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
