import { Controller, Post, Body } from '@nestjs/common';
import { LoanReceivableAssignmentV2Service } from '../services/loanreceivable-assignment-v2.service';

@Controller('loanreceivable-assignment-v2')
export class LoanReceivableAssignmentV2Controller {
  constructor(private readonly service: LoanReceivableAssignmentV2Service) {}

  /**
   * Manual trigger (for admin / testing)
   */
  @Post('run')
  async run() {
    await this.service.run();
    return { ok: true, message: 'Assignment cycle executed' };
  }
}
