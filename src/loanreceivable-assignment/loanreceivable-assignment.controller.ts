import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  ParseIntPipe
} from '@nestjs/common';

import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';

@Controller('loanreceivable-assignment')
export class LoanReceivableAssignmentController {
  constructor(
    private readonly service: LoanReceivableAssignmentService
  ) {}

  /** 🔹 Trigger assignment job manually */
  @Post('run')
  async runAssignment() {
    await this.service.assignLoans();
    return { status: 'Assignment process executed' };
  }

  /** 🔹 Get agent load */
  @Get('load')
  async getAgentLoad(@Query('agentId') agentId?: number) {
    return this.service.getAgentLoad({
      agentId: agentId ? Number(agentId) : undefined,
    });
  }

  /** 🔹 Override multiple assignments */
  @Post('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverrideAssignments(dto);
  }

  /** 🔹 Mark a record processed */
  @Post('mark-processed/:assignmentId/:agentId')
  async markProcessed(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('agentId', ParseIntPipe) agentId: number,
  ) {
    return this.service.markProcessed(assignmentId, agentId);
  }
}
