@Entity('LoanAssignment_Attachments')
export class LoanAssignmentAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LoanAssignmentPersonalSnapshot, s => s.attachments)
  snapshot: LoanAssignmentPersonalSnapshot;

  @Column()
  attachmentType: string;

  @Column()
  filePath: string;

  @CreateDateColumn()
  uploadedAt: Date;
}
