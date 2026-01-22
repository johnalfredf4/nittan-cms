import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanRetentionRule } from './entities/loan-retention-rule.entity';
import { CreateRetentionRuleDto } from './dto/create-retention-rule.dto';
import { UpdateRetentionRuleDto } from './dto/update-retention-rule.dto';
import { QueryRetentionRuleDto } from './dto/query-retention-rule.dto';

@Injectable()
export class RetentionRulesService {
  constructor(
    @InjectRepository(LoanRetentionRule)
    private readonly repo: Repository<LoanRetentionRule>,
  ) {}

  async create(dto: CreateRetentionRuleDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: QueryRetentionRuleDto) {
    return this.repo.find({
      where: {
        ...(query.categoryCode && { categoryCode: query.categoryCode }),
        ...(query.isActive !== undefined && { isActive: query.isActive }),
      },
      order: { dpdMin: 'ASC' },
    });
  }

  async findOne(id: number) {
    const rule = await this.repo.findOneBy({ id });
    if (!rule) {
      throw new NotFoundException('Retention rule not found');
    }
    return rule;
  }

  async update(id: number, dto: UpdateRetentionRuleDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async toggle(id: number, isActive: boolean) {
    await this.findOne(id);
    await this.repo.update(id, { isActive });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.repo.delete(id);
  }
}
