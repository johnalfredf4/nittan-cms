import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AccountRetention } from './entities/account-retention.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRetentionDto } from './dto/create-retention.dto';
import { UpdateRetentionDto } from './dto/update-retention.dto';

@Injectable()
export class AccountRetentionService {
  constructor(
    @InjectRepository(AccountRetention, 'nittan_app')
    private repo: Repository<AccountRetention>,
  ) {}

  async create(dto: CreateRetentionDto) {
    const exists = await this.repo.findOne({ where: { accountClass: dto.accountClass }});
    if (exists) {
      throw new Error('A record for this Account Class already exists.');
    }

    const record = this.repo.create(dto);
    return await this.repo.save(record);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const record = await this.repo.findOne({ where: { id } });

    if (!record) {
      throw new NotFoundException('Retention record not found');
    }

    return record;
  }

  async update(id: number, dto: UpdateRetentionDto) {
    const record = await this.findOne(id);
    Object.assign(record, dto);
    return await this.repo.save(record);
  }

  async toggleActive(id: number) {
    const record = await this.findOne(id);
    record.isActive = !record.isActive;
    return await this.repo.save(record);
  }

  async remove(id: number) {
    const record = await this.findOne(id);
    return await this.repo.remove(record);
  }
}

