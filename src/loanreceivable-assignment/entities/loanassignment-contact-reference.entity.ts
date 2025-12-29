@Entity('LoanAssignment_ContactReferences')
export class LoanAssignmentContactReference {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, s => s.references)
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
