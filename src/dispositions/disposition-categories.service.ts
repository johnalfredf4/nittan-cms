import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DispositionCategory } from './entities/disposition-category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class DispositionCategoriesService {
  constructor(
    @InjectRepository(DispositionCategory)
    private repo: Repository<DispositionCategory>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.repo.findOne({ where: { categoryName: dto.categoryName }});
    if (exists) throw new Error('Category already exists');

    const record = this.repo.create(dto);
    return await this.repo.save(record);
  }

  async findAll() {
    return await this.repo.find({
      order: { categoryName: 'ASC' }
    });
  }

  async findOne(id: number) {
    const record = await this.repo.findOne({ where: { id }});
    if (!record) throw new NotFoundException('Category not found');
    return record;
  }

  async update(id: number, dto: UpdateCategoryDto) {
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
