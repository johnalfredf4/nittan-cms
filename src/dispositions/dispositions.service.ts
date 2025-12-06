import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Disposition } from './entities/disposition.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDispositionDto } from './dto/create-disposition.dto';
import { UpdateDispositionDto } from './dto/update-disposition.dto';

@Injectable()
export class DispositionsService {
  constructor(
    @InjectRepository(Disposition)
    private repo: Repository<Disposition>,
  ) {}

  async create(dto: CreateDispositionDto) {
    const record = this.repo.create(dto);
    return await this.repo.save(record);
  }

  async findByCategory(categoryId: number) {
    return await this.repo.find({
      where: { categoryId },
      order: { dispositionName: 'ASC' }
    });
  }

  async findOne(id: number) {
    const record = await this.repo.findOne({ where: { id }});
    if (!record) throw new NotFoundException('Disposition not found');
    return record;
  }

  async update(id: number, dto: UpdateDispositionDto) {
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
