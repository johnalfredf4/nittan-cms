import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'Document_Requirements' })
export class DocumentRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ default: true })
  isRequired: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;
}
