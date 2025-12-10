import { Controller, Post, Body } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';

class SendEmailDto {
  to: string;
  subject: string;
  message: string;
}

@Controller('email')
export class EmailSenderController {
  constructor(private readonly emailSenderService: EmailSenderService) {}

  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.emailSenderService.sendEmail(
      dto.to,
      dto.subject,
      dto.message
    );
  }
}
