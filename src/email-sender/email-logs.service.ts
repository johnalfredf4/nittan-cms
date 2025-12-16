import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSendLog } from './entities/email-send-log.entity';

@Injectable()
export class EmailLogsService {
  constructor(
    @InjectRepository(EmailSendLog, 'nittan_app')
    private readonly emailLogRepo: Repository<EmailSendLog>,
  ) {}

  // 🔹 Get all logs (paginated)
  async getAll(page = 1, limit = 20) {
    const [data, total] = await this.emailLogRepo.findAndCount({
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      page,
      limit,
      total,
      data,
    };
  }

  // 🔹 Get logs by LoanReceivable_Assignments ID
  async getByReferenceId(referenceId: number) {
    return this.emailLogRepo.find({
      where: { referenceId },
      order: { sentAt: 'DESC' },
    });
  }
}
