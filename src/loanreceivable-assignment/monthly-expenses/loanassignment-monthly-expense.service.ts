import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentMonthlyExpense } from '../snapshot/entities/loanassignment-monthly-expense.entity';
import { CreateMonthlyExpenseDto } from './dto/create-monthly-expense.dto';
import { UpdateMonthlyExpenseDto } from './dto/update-monthly-expense.dto';

@Injectable()
export class LoanAssignmentMonthlyExpenseService {
  constructor(
    @InjectRepository(LoanAssignmentMonthlyExpense, 'nittan_app')
    private readonly expenseRepo: Repository<LoanAssignmentMonthlyExpense>,
  ) {}

  /* =========================
     CREATE
  ========================= */
  async create(dto: CreateMonthlyExpenseDto) {
    return this.expenseRepo.save({
      expenseType: dto.expenseType,
      amount: dto.amount.toString(),

      creditor: dto.creditor,
      creditAmount: dto.creditAmount?.toString(),
      outstandingBalance: dto.outstandingBalance?.toString(),

      snapshot: { id: dto.personalSnapshotId },
    });
  }

  /* =========================
     READ (BY SNAPSHOT)
  ========================= */
  async findBySnapshot(personalSnapshotId: number) {
    return this.expenseRepo.find({
      where: {
        snapshot: { id: personalSnapshotId },
      },
      order: { id: 'ASC' },
    });
  }

  /* =========================
     UPDATE
  ========================= */
  async update(id: number, dto: UpdateMonthlyExpenseDto) {
    const expense = await this.expenseRepo.findOne({ where: { id } });
    if (!expense) {
      throw new NotFoundException('Monthly expense record not found');
    }

    if (dto.expenseType !== undefined) {
      expense.expenseType = dto.expenseType;
    }

    if (dto.amount !== undefined) {
      expense.amount = dto.amount.toString();
    }

    if (dto.creditor !== undefined) {
      expense.creditor = dto.creditor;
    }

    if (dto.creditAmount !== undefined) {
      expense.creditAmount = dto.creditAmount.toString();
    }

    if (dto.outstandingBalance !== undefined) {
      expense.outstandingBalance = dto.outstandingBalance.toString();
    }

    return this.expenseRepo.save(expense);
  }

  /* =========================
     DELETE
  ========================= */
  async delete(id: number) {
    const result = await this.expenseRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Monthly expense record not found');
    }

    return { ok: true };
  }
}
