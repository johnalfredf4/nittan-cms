import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import { LocationType } from './loan-assignment.entity';

@Entity({ name: 'Loan_Assignment_Rotation' })
@Index(['locationType', 'branchId'], { unique: true })
export class RotationState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LocationType })
  locationType: LocationType;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'int', default: 0 })
  lastIndex: number;
}
