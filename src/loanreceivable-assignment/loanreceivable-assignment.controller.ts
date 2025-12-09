import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { LoanreceivableAssignmentService } from './loanreceivable-assignment.service';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Controller('loanreceivable-assignment')
export class LoanreceivableAssignmentController {
  constructor(
    private readonly service: LoanreceivableAssignmentService,
  ) {}

  // For Agent "My Queue"
  @Get('agent/:agentId')
  getQueueForAgent(
    @Param('agentId', ParseIntPipe) agentId: number,
  ) {
    return this.service.getQueueForAgent(agentId);
  }

  @Post('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverrideAssignments(dto);
  }
  
  // Mark processed by agent (after they work the account)
  @Patch(':id/processed')
  markProcessed(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsProcessed(id);
  }
}
