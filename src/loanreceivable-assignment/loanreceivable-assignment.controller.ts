import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param 
} from '@nestjs/common';

import { LoanreceivableAssignmentService } from './loanreceivable-assignment.service';
import { BulkOverrideAssignmentDto } from './dto/bulk-override.dto';

@Controller('loanreceivable-assignment')
export class LoanreceivableAssignmentController {
  constructor(private readonly service: LoanreceivableAssignmentService) {}

  @Post('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverrideAssignments(dto);
  }
}
