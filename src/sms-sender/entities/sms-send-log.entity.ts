import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('SMS_Send_Logs')
export class SmsSendLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  toMobile: string;

  @Column('nvarchar', { length: 'max' })
  message: string;

  @Column()
  referenceId: number;

  @Column()
  agentName: string;

  @Column({ default: () => 'GETDATE()' })
  sentAt: Date;

  @Column()
  sentStatus: boolean;

  @Column({ nullable: true })
  errorMessage?: string;
}
