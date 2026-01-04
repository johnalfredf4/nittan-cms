import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentContactReference } from '../snapshot/entities/loanassignment-contact-reference.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';
import { CreateContactReferenceDto } from './dto/create-contact-reference.dto';
import { UpdateContactReferenceDto } from './dto/update-contact-reference.dto';

@Injectable()
export class LoanAssignmentContactReferenceService {
  constructor(
    @InjectRepository(LoanAssignmentContactReference, 'nittan_app')
    private readonly refRepo: Repository<LoanAssignmentContactReference>,

    @InjectRepository(LoanAssignmentPersonalSnapshot, 'nittan_app')
    private readonly snapshotRepo: Repository<LoanAssignmentPersonalSnapshot>,
  ) {}

  async create(dto: CreateContactReferenceDto) {
    const snapshot = await this.snapshotRepo.findOne({
      where: { id: dto.personalSnapshotId },
    });

    if (!snapshot) {
      throw new NotFoundException('Personal snapshot not found');
    }

    const ref = this.refRepo.create({
      snapshot,
      referenceName: dto.referenceName,
      address: dto.address,
      contactNumber: dto.contactNumber,
      employer: dto.employer,
      section: dto.section ?? 'Relatives',
      relationship: dto.relationship,
    });

    return this.refRepo.save(ref);
  }

  async findBySnapshot(personalSnapshotId: number) {
    return this.refRepo.find({
      where: { snapshot: { id: personalSnapshotId } },
      order: { id: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateContactReferenceDto) {
    const ref = await this.refRepo.findOne({ where: { id } });

    if (!ref) {
      throw new NotFoundException('Contact reference not found');
    }

    Object.assign(ref, dto);
    return this.refRepo.save(ref);
  }

  async delete(id: number) {
    const result = await this.refRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Contact reference not found');
    }

    return { ok: true };
  }
}
