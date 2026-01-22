import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { AgentWorkloadService } from './agent-workload.service';
import { QueryAgentWorkloadDto } from './dto/query-agent-workload.dto';
import { ReassignLoanDto } from './dto/reassign-loan.dto';

@Controller('loanreceivable-assignment/agent-workload')
export class AgentWorkloadController {
  constructor(private readonly service: AgentWorkloadService) {}

  /* ============================================================
     ADMIN: VIEW AGENT WORKLOAD
  ============================================================ */
  @Get()
  getWorkload(@Query() query: QueryAgentWorkloadDto) {
    return this.service.getWorkload(query);
  }

  /* ============================================================
     ADMIN: REASSIGN LOAN
  ============================================================ */
  @Post('reassign')
  reassign(@Body() dto: ReassignLoanDto) {
    return this.service.reassign(dto);
  }
}
