import { Module } from '@nestjs/common';
import { SmsSenderController } from './sms-sender.controller';
import { SmsSenderService } from './sms-sender.service';

@Module({
  controllers: [SmsSenderController],
  providers: [SmsSenderService],
})
export class SmsSenderModule {}
