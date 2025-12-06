import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SmsTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateCode: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
