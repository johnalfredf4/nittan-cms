import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'tblBranches' })
export class Branch {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'Name' })
  name: string;
}
