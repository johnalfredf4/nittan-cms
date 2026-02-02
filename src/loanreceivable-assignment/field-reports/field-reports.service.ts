import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanAssignmentFieldReport } from './entities/loan-assignment-field-report.entity';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';

@Injectable()
export class FieldReportsService {
  constructor(
    @InjectRepository(LoanAssignmentFieldReport, 'nittan_app')
    private readonly repo: Repository<LoanAssignmentFieldReport>,
  ) {}

  /* ===============================
     GET LATEST FIELD REPORT
  =============================== */
  async getLatest(loanAssignmentId: number) {
    return this.repo.findOne({
      where: {
        loanAssignmentId,
        isDeleted: false,
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /* ===============================
     CREATE
  =============================== */
  async create(dto: CreateFieldReportDto) {
    return this.repo.save({
      ...dto,
    });
  }

  /* ===============================
     UPDATE
  =============================== */
  async update(id: number, dto: UpdateFieldReportDto) {
    const report = await this.repo.findOneBy({
      id,
      isDeleted: false,
    });

    if (!report) {
      throw new NotFoundException('Field report not found');
    }

    Object.assign(report, dto);
    return this.repo.save(report);
  }

  /* ===============================
     DELETE (SOFT)
  =============================== */
  async remove(id: number) {
    const report = await this.repo.findOneBy({
      id,
      isDeleted: false,
    });

    if (!report) {
      throw new NotFoundException('Field report not found');
    }

    report.isDeleted = true;
    return this.repo.save(report);
  }
}
