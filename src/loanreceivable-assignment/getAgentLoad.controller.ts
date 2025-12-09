import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoanReceivableAssignmentService } from './loanreceivable-assignment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AgentFilterDto } from './dto/agent-filter.dto';

@Controller('loanreceivable-assignment')
@UseGuards(JwtAuthGuard)
export class LoanReceivableAssignmentController {
  constructor(
    private readonly service: LoanReceivableAssignmentService,
  ) {}

  @Get('agent-load')
  async getAgentLoad(@Query() query: AgentFilterDto) {
    return await this.service.getAgentLoad(query);
  }
}
