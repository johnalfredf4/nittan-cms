import { Module } from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';
import { SmsTemplatesController } from './sms-templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsTemplate } from './entities/sms-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SmsTemplate])],
  controllers: [SmsTemplatesController],
  providers: [SmsTemplatesService],
})
export class SmsTemplatesModule {}
