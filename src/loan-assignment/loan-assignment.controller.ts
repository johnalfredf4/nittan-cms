import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { LoanAssignmentService } from './loan-assignment.service';
import { OverrideAssignmentDto } from './dto/override-assignment.dto';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Controller('loan-assignments')
export class LoanAssignmentController {
  constructor(private readonly service: LoanAssignmentService) {}

  @Get('my-queue')
  async getQueue(@Req() req) {
    return this.service.getAgentQueue(req.user.id);
  }

  @Patch('override')
  async override(@Body() dto: OverrideAssignmentDto) {
    return this.service.overrideAssignment(dto);
  }

  @Patch('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverride(dto);
  }
}
