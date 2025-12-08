import { Module } from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';
import { SmsTemplatesController } from './sms-templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsTemplate } from './entities/sms-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SmsTemplate], 'nittan_app'), // 👈 FIXED
  ],
  controllers: [SmsTemplatesController],
  providers: [SmsTemplatesService],
  exports: [SmsTemplatesService], // optional, but helpful for reuse
})
export class SmsTemplatesModule {}
