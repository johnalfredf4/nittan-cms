import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LocationType } from '../types/location-type';

@Entity({ name: 'Loan_Assignment_Rotation' })
export class RotationState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  locationType: LocationType;

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'int', default: 0 })
  lastAssignedAgentIndex: number;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  updatedAt: Date;
}
