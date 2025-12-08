import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { LocationType } from '../types/location-type';
import { LOCATION_HQ, LOCATION_BRANCH } from '../constants/location-constants';



@Entity('Loan_Assignment_Rotation')
export class RotationState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  locationType: string;

  @Column({ type: 'int', nullable: true })
  branchId: number;

  @Column({ type: 'int', default: 0 })
  lastIndex: number;
}

