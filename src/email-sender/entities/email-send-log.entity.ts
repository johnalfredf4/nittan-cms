import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Email_Send_Logs')
export class EmailSendLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toEmail: string;

  @Column({ nullable: true })
  emailTemplateId?: number;

  @Column()
  subject: string;

  @Column('nvarchar', { length: 'max' })
  message: string;

  @Column()
  referenceId: number;

  @Column({ default: () => 'GETDATE()' })
  sentAt: Date;

  @Column()
  sentStatus: boolean;

  @Column({ nullable: true })
  errorMessage?: string;
}
