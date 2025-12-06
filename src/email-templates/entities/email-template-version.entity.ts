import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class EmailTemplateVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  TemplateId: number;

  @Column()
  Subject: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  Body: string;

  @CreateDateColumn()
  VersionDate: Date;
}
