import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { LocationType } from '../types/location-type';

@Column({ type: 'varchar', length: 10 })
locationType: LocationType;

@Entity()
export class RotationState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  locationType: 'HQ' | 'BRANCH';

  @Column({ type: 'int', nullable: true })
  branchId: number | null;

  @Column({ type: 'int', default: 0 })
  lastAssignedAgentIndex: number;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  updatedAt: Date;
}
