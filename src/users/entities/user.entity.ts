import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne, 
  JoinColumn, 
} from 'typeorm';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Role } from '../../roles/entities/role.entity';
import { Branch } from '../../branches/entities/branch.entity';

@Entity('User_Accounts')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'email_address', unique: true })
  emailAddress: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true, length: 100 })
  middleName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  // 👇 Add these columns (match DB column names

  @Column({ name: 'BranchId', nullable: true })
  branchId?: number;
  
  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'BranchId' })
  branch?: Branch;

  @Column({ name: 'EmployeeID' })
  employeeId: number;


  @Column({ type: 'int', default: UserStatus.ACTIVE })
  status: UserStatus;

  // ✅ NEW COLUMN
  //@Column({
  //  name: 'IsPasswordChanged',
  //  type: 'bit',
  //  default: false,
  //})
  //isPasswordChanged: boolean;

  @Column({
    name: 'IsPasswordChanged',
    type: 'bit',
    default: 0,
  })
  isPasswordChanged: boolean;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'User_Roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];
}
