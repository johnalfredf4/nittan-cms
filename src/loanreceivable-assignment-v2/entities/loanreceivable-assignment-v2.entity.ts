import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('LoanReceivable_Assignments_V2')
@Index(['loanReceivableId', 'status'])
@Index(['status', 'retentionUntil'])
export class LoanReceivableAssignmentV2 {
@PrimaryGeneratedColumn()
id: number;


@Column()
loanApplicationId: number;


@Column()
loanReceivableId: number;


@Column()
agentId: number;


@Column()
dpd: number;


@Column({ length: 10 })
categoryCode: string; // CAT1..CAT8


@Column()
retentionDays: number; // CMS-driven


@Column({ type: 'datetime' })
retentionUntil: Date;


@Column({ length: 20, default: 'ACTIVE' })
status: 'ACTIVE' | 'EXPIRED';


@CreateDateColumn({ type: 'datetime' })
createdAt: Date;


@UpdateDateColumn({ type: 'datetime' })
updatedAt: Date;
}