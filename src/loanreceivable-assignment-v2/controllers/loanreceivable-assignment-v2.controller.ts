import { Controller, Post, Body } from '@nestjs/common';
import { LoanReceivableAssignmentV2Service } from '../services/loanreceivable-assignment-v2.service';

@Controller('loanreceivable-assignment-v2')
export class LoanReceivableAssignmentV2Controller {
  constructor(private readonly service: LoanReceivableAssignmentV2Service) {}

  @Post('run')
  run(@Body() body: { agentIds: number[]; maxPerAgent?: number }) {
    return this.service.run(body.agentIds, body.maxPerAgent);
  }
}
