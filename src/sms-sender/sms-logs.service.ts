import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsSendLog } from './entities/sms-send-log.entity';

@Injectable()
export class SmsLogsService {
  constructor(
    @InjectRepository(SmsSendLog, 'nittan_app')
    private readonly smsLogRepo: Repository<SmsSendLog>,
  ) {}

  getAll(page = 1, limit = 20) {
    return this.smsLogRepo.find({
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  getByReferenceId(referenceId: number) {
    return this.smsLogRepo.find({
      where: { referenceId },
      order: { sentAt: 'DESC' },
    });
  }
}
