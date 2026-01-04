import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentIdentification } from '../snapshot/entities/loanassignment-identification.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';

import { CreateIdentificationDto } from './dto/create-identification.dto';
import { UpdateIdentificationDto } from './dto/update-identification.dto';

@Injectable()
export class LoanAssignmentIdentificationService {
  constructor(
    @InjectRepository(LoanAssignmentIdentification, 'nittan_app')
    private readonly idRepo: Repository<LoanAssignmentIdentification>,

    @InjectRepository(LoanAssignmentPersonalSnapshot, 'nittan_app')
    private readonly snapshotRepo: Repository<LoanAssignmentPersonalSnapshot>,
  ) {}

  /* ============================
     CREATE
  ============================ */
  async create(dto: CreateIdentificationDto) {
    const snapshot = await this.snapshotRepo.findOne({
      where: { id: dto.personalSnapshotId },
    });

    if (!snapshot) {
      throw new NotFoundException('Personal snapshot not found');
    }

    const identification = this.idRepo.create({
      snapshot,
      idType: dto.idType,
      idNumber: dto.idNumber,
      dateIssued: dto.dateIssued
        ? new Date(dto.dateIssued)
        : null,
      countryIssued: dto.countryIssued,
    });

    return this.idRepo.save(identification);
  }

  /* ============================
     LIST BY SNAPSHOT
  ============================ */
  async findBySnapshot(personalSnapshotId: number) {
    return this.idRepo.find({
      where: {
        snapshot: { id: personalSnapshotId },
      },
      order: { id: 'ASC' },
    });
  }

  /* ============================
     UPDATE
  ============================ */
  async update(id: number, dto: UpdateIdentificationDto) {
    const identification = await this.idRepo.findOne({
      where: { id },
    });

    if (!identification) {
      throw new NotFoundException('Identification not found');
    }

    if (dto.idType !== undefined) {
      identification.idType = dto.idType;
    }

    if (dto.idNumber !== undefined) {
      identification.idNumber = dto.idNumber;
    }

    if (dto.dateIssued !== undefined) {
      identification.dateIssued = dto.dateIssued
        ? new Date(dto.dateIssued)
        : null;
    }

    if (dto.countryIssued !== undefined) {
      identification.countryIssued = dto.countryIssued;
    }

    return this.idRepo.save(identification);
  }

  /* ============================
     DELETE
  ============================ */
  async delete(id: number) {
    const result = await this.idRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Identification not found');
    }

    return { ok: true };
  }
}
