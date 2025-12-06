import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('SMS_Templates')
export class SmsTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateCode: string;

  @Column()
  title: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  message: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  updatedAt: Date;
}
