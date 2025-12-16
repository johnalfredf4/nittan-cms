import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmailLogsService } from './email-logs.service';

@UseGuards(AuthGuard('jwt'))
@Controller('email/logs')
export class EmailLogsController {
  constructor(private readonly emailLogsService: EmailLogsService) {}

  // 🔹 GET /email/logs?page=1&limit=20
  @Get()
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.emailLogsService.getAll(
      Number(page || 1),
      Number(limit || 20),
    );
  }

  // 🔹 GET /email/logs/reference/:referenceId
  @Get('reference/:referenceId')
  async getByReference(@Param('referenceId') referenceId: string) {
    return this.emailLogsService.getByReferenceId(Number(referenceId));
  }
}
