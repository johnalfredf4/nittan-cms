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
    const expense = this.expenseRepo.create({
      expenseType: dto.expenseType,          // ✅ correct
      amount: dto.amount.toString(),          // ✅ string
  
      creditor: dto.creditor ?? null,
      creditAmount: dto.creditAmount ?? null, // ✅ number
      outstandingBalance: dto.outstandingBalance ?? null, // ✅ number
  
      snapshot: { id: dto.personalSnapshotId }, // ✅ RELATION
    });
  
    return this.expenseRepo.save(expense);
  }


  /* =========================
     READ (BY SNAPSHOT)
  ========================= */
  async findBySnapshot(personalSnapshotId: number) {
    return this.expenseRepo.find({
      where: {
        snapshot: { id: personalSnapshotId }, // ✅ relation-based filter
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
      throw new NotFoundException('Monthly expense not found');
    }
  
    if (dto.expenseType !== undefined) {
      expense.expenseType = dto.expenseType;
    }
  
    if (dto.amount !== undefined) {
      expense.amount = dto.amount.toString(); // ✅ convert
    }
  
    if (dto.creditor !== undefined) {
      expense.creditor = dto.creditor;
    }
  
    if (dto.creditAmount !== undefined) {
      expense.creditAmount = dto.creditAmount; // ✅ number
    }
  
    if (dto.outstandingBalance !== undefined) {
      expense.outstandingBalance = dto.outstandingBalance; // ✅ number
    }
  
    return this.expenseRepo.save(expense);
  }


  /* =========================
     DELETE
  ========================= */
  async delete(id: number) {
    return this.expenseRepo.delete(id);
  }

}

