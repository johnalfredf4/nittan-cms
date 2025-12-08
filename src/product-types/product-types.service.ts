import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductType } from './entities/product-type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType, 'nittan_app')
    private repo: Repository<ProductType>,
  ) {}

  async create(dto: CreateProductTypeDto) {
    const item = this.repo.create(dto);
    return await this.repo.save(item);
  }

  async findAll() {
    return await this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Product Type not found');
    }
    return item;
  }

  async update(id: number, dto: UpdateProductTypeDto) {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return await this.repo.save(item);
  }

  async toggleActive(id: number) {
    const item = await this.findOne(id);
    item.isActive = !item.isActive;
    return await this.repo.save(item);
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return await this.repo.remove(item);
  }
}
