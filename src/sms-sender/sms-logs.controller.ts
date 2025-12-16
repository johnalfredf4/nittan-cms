import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SmsLogsService } from './sms-logs.service';

@UseGuards(AuthGuard('jwt'))
@Controller('sms/logs')
export class SmsLogsController {
  constructor(private readonly smsLogsService: SmsLogsService) {}

  @Get()
  getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.smsLogsService.getAll(
      Number(page || 1),
      Number(limit || 20),
    );
  }

  @Get('reference/:referenceId')
  getByReference(@Param('referenceId') referenceId: string) {
    return this.smsLogsService.getByReferenceId(Number(referenceId));
  }
}
