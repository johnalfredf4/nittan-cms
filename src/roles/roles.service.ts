import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
  ) {}

  async findAll() {
    return this.roleRepository.find();
  }


  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepo.findOne({ where: { name } });
  }

  async seedDefaultRoles(): Promise<void> {
    const names = [
      'Collection Agent - Head Office',
      'Collection Agent - Branch',
      'Collection Supervisor - Head Office',
      'Collection Supervisor - Branch',
      'Collection QA - Head Office',
      'Collection QA - Branch',
      'Credit Investigator - Head Office',
      'Credit Investigator - Branch',
      'IT - CMS Admin',
      'Legal',
      'Execom - OM',
      'Execom - CEO',
      'Collection Agent',
      'IT, Execom - OM',
    ];

    for (const name of names) {
      const exists = await this.rolesRepo.findOne({ where: { name } });
      if (!exists) {
        const role = this.rolesRepo.create({ name });
        await this.rolesRepo.save(role);
      }
    }
  }
}
