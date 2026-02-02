import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreditInvestigationReport } from './entities/credit-investigation.entity';
import { CreditInvestigationCoBorrower } from './entities/credit-investigation-coborrower.entity';

import { CreateCreditInvestigationDto } from './dto/create-cir.dto';
import { UpdateCreditInvestigationDto } from './dto/update-cir.dto';
import { CreateCreditInvestigationCoBorrowerDto } from './dto/create-coborrower.dto';

@Injectable()
export class CreditInvestigationService {
  constructor(
    @InjectRepository(CreditInvestigationReport, 'nittan_app')
    private readonly cirRepo: Repository<CreditInvestigationReport>,

    @InjectRepository(CreditInvestigationCoBorrower, 'nittan_app')
    private readonly coRepo: Repository<CreditInvestigationCoBorrower>,
  ) {}

  /* ===============================
     CREDIT INVESTIGATION REPORT
  =============================== */

  async create(dto: CreateCreditInvestigationDto) {
    const report = this.cirRepo.create(dto);
    return this.cirRepo.save(report);
  }

  async findOne(id: number) {
    const report = await this.cirRepo.findOne({
      where: { id, isDeleted: false },
    });

    if (!report) {
      throw new NotFoundException(
        'Credit Investigation Report not found',
      );
    }

    return report;
  }

  async update(
    id: number,
    dto: UpdateCreditInvestigationDto,
  ) {
    await this.findOne(id); // ensures existence
    await this.cirRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id); // ensures existence
    return this.cirRepo.update(id, {
      isDeleted: true,
    });
  }

  /* ===============================
     CO-BORROWERS (1 : MANY)
  =============================== */

  async addCoBorrower(
    dto: CreateCreditInvestigationCoBorrowerDto,
  ) {
    // Optional safety check:
    await this.findOne(dto.creditInvestigationReportId);

    const coBorrower = this.coRepo.create(dto);
    return this.coRepo.save(coBorrower);
  }

  async getCoBorrowers(reportId: number) {
    // Optional safety check:
    await this.findOne(reportId);

    return this.coRepo.find({
      where: {
        creditInvestigationReportId: reportId,
        isDeleted: false,
      },
      order: { createdAt: 'ASC' },
    });
  }

  async deleteCoBorrower(id: number) {
    const record = await this.coRepo.findOne({
      where: { id, isDeleted: false },
    });

    if (!record) {
      throw new NotFoundException(
        'Co-borrower not found',
      );
    }

    return this.coRepo.update(id, {
      isDeleted: true,
    });
  }
}
