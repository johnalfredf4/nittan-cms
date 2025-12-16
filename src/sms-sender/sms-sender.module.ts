import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmsSenderService } from './sms-sender.service';
import { SmsSenderController } from './sms-sender.controller';

import { SmsLogsService } from './sms-logs.service';
import { SmsLogsController } from './sms-logs.controller';

import { SmsSendLog } from './entities/sms-send-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmsSendLog], 'nittan_app'),
  ],
  controllers: [
    SmsSenderController,
    SmsLogsController,
  ],
  providers: [
    SmsSenderService,
    SmsLogsService,
  ],
})
export class SmsSenderModule {}
