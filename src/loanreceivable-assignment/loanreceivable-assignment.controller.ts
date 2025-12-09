import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { LoanreceivableAssignmentService } from './loanreceivable-assignment.service';

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

  // Mark processed by agent (after they work the account)
  @Patch(':id/processed')
  markProcessed(@Param('id', ParseIntPipe) id: number) {
    return this.service.markAsProcessed(id);
  }
}
