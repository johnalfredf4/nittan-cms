import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { SmsSenderService } from './sms-sender.service';
import { AuthGuard } from '@nestjs/passport';

class SendSmsDto {
  to: string;
  message: string;
  referenceId: number;
}

@Controller('sms')
export class SmsSenderController {
  constructor(private readonly smsSenderService: SmsSenderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('send')
  async send(@Req() req: any, @Body() dto: SendSmsDto) {
    const agentName = `${req.user.firstName ?? ''} ${req.user.lastName ?? ''}`.trim()
      || req.user.username;

    return this.smsSenderService.sendSms({
      ...dto,
      agentName,
    });
  }
}
