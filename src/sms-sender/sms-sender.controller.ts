import { Controller, Post, Body } from '@nestjs/common';
import { SmsSenderService } from './sms-sender.service';

class SendSmsDto {
  to: string;
  message: string;
}

@Controller('sms')
export class SmsSenderController {
  constructor(private readonly smsSenderService: SmsSenderService) {}

  @Post('send')
  async sendSms(@Body() dto: SendSmsDto) {
    return this.smsSenderService.sendSMS(dto.to, dto.message);
  }
}
