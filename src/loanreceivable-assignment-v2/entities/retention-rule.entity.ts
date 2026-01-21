import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('RetentionRules')
export class RetentionRule {
@PrimaryGeneratedColumn()
id: number;


@Column()
categoryCode: string;


@Column()
minDpd: number;


@Column({ nullable: true })
maxDpd?: number;


@Column({ nullable: true })
retentionDays?: number;


@Column()
label: string;


@Column({ default: true })
isActive: boolean;


@CreateDateColumn()
createdAt: Date;


@UpdateDateColumn()
updatedAt: Date;
}