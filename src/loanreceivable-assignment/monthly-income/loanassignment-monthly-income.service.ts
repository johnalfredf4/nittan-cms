import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentMonthlyIncome } from '../snapshot/entities/loanassignment-monthly-income.entity';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Injectable()
export class LoanAssignmentMonthlyIncomeService {
    constructor(
        @InjectRepository(LoanAssignmentMonthlyIncome, 'nittan_app')
        private readonly incomeRepo: Repository<LoanAssignmentMonthlyIncome>,
    ) { }

    /* =========================
       CREATE
    ========================= */
   async create(dto: CreateMonthlyIncomeDto) {
      return this.incomeRepo.save({
        incomeType: dto.incomeType as any,
        amount: dto.amount,
        bankName: dto.bankName,
        bankBranch: dto.bankBranch,
        accountNumber: dto.accountNumber,
        snapshot: { id: dto.personalSnapshotId },
      });
    }
    
    async findBySnapshot(personalSnapshotId: number) {
      return this.incomeRepo.find({
        where: {
          snapshot: { id: personalSnapshotId },
        },
        order: { id: 'ASC' },
      });
    }


    /* =========================
       UPDATE
    ========================= */
    async update(id: number, dto: UpdateMonthlyIncomeDto) {
        const income = await this.incomeRepo.findOne({ where: { id } });
        if (!income) {
            throw new NotFoundException('Monthly income record not found');
        }

        Object.assign(income, dto);
        return this.incomeRepo.save(income);
    }

    /* =========================
       DELETE
    ========================= */
    async delete(id: number) {
        const result = await this.incomeRepo.delete(id);
        if (!result.affected) {
            throw new NotFoundException('Monthly income record not found');
        }

        return { ok: true };
    }
}

