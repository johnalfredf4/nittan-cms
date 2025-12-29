@Entity('LoanAssignment_MonthlyIncome')
export class LoanAssignmentMonthlyIncome {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, s => s.incomes)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  incomeType: 'Applicant' | 'Spouse';

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column({ nullable: true }) bankName?: string;
  @Column({ nullable: true }) bankBranch?: string;
  @Column({ nullable: true }) accountNumber?: string;
}
