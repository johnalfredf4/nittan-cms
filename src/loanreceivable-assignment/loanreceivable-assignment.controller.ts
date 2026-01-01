import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';
import { OverrideSingleDto } from './dto/override-single.dto';
import { AgentFilterDto } from './dto/agent-filter.dto';

@Controller('loanreceivable-assignment')
export class LoanReceivableAssignmentController {
  constructor(
    private readonly service: LoanReceivableAssignmentService,
  ) {}

  /* =====================================================
     🔹 MANUAL TRIGGER (OPTIONAL / ADMIN)
  ===================================================== */
  @Post('run')
  async runAssignment() {
    await this.service.assignLoans();
    return {
      ok: true,
      message: 'Assignment process executed successfully',
    };
  }

  /* =====================================================
     🔹 AGENT LOAD
  ===================================================== */
  @Get('agent-load')
  async getAgentLoad(@Query() query: AgentFilterDto) {
    return this.service.getAgentLoad(query);
  }

  /* =====================================================
     🔹 FETCH ASSIGNMENTS PER AGENT
  ===================================================== */
  @Get('assignments')
  async getAssignments(
    @Query('agentId', ParseIntPipe) agentId: number,
  ) {
    return this.service.findActiveAssignmentsByAgent(agentId);
  }

  /* =====================================================
     🔹 BULK OVERRIDE
  ===================================================== */
  @Post('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverrideAssignments(dto);
  }

  /* =====================================================
     🔹 SINGLE OVERRIDE
  ===================================================== */
  @Patch('override-single/:assignmentId')
  async overrideSingle(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() dto: OverrideSingleDto,
  ) {
    return this.service.overrideSingle(assignmentId, dto);
  }

  /* =====================================================
     🔹 MARK AS PROCESSED
  ===================================================== */
  @Patch('mark-processed/:assignmentId')
  async markProcessed(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Query('agentId', ParseIntPipe) agentId: number,
  ) {
    return this.service.markProcessed(
      assignmentId,
      agentId,
    );
  }

  @Get(':assignmentId/profile')
  async getLoanProfile(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.service.getLoanProfile(assignmentId);
  }
  
}
