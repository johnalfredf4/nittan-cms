import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailSenderService } from './email-sender.service';
import { AuthGuard } from '@nestjs/passport';

class SendEmailDto {
  to: string;
  subject: string;
  message: string;
  referenceId: number;        // LoanReceivable_Assignments.ID
  emailTemplateId?: number;   // optional
}

@Controller('email')
export class EmailSenderController {
  constructor(private readonly emailSenderService: EmailSenderService) {}

  @UseGuards(AuthGuard('jwt')) // ✅ protect endpoint
  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    // ✅ pass the FULL DTO to the service
    return this.emailSenderService.sendEmail(dto);
  }
}
