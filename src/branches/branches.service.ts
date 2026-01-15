import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch, 'nittan_app')
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async findAll(): Promise<Branch[]> {
    return this.branchRepo.find({
      select: ['id', 'name'],
      order: { name: 'ASC' },
    });
  }
}
