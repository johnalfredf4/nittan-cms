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
import { OverrideSingleDto } from './dto/override-single.dto';
import { AgentFilterDto } from './dto/agent-filter.dto';
import { HttpException, HttpStatus } from '@nestjs/common';


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
  @Get('agent-load')
  async getAgentLoad(@Query() query: AgentFilterDto) {
    return this.service.getAgentLoad(query);
  }

  @Get('assignments')
  async getAssignments(@Query('agentId') agentId: number) {
    if (!agentId) {
      throw new HttpException('agentId is required', HttpStatus.BAD_REQUEST);
    }
  
    return await this.service.findActiveAssignmentsByAgent(agentId);
  }

  /** 🔹 Override multiple assignments */
  @Post('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverrideAssignments(dto);
  }

  /** 🔹 Override a single assignment */
  //@Post('override/:assignmentId')
  //async overrideSingle(
  //  @Param('assignmentId', ParseIntPipe) assignmentId: number,
  //  @Body() dto: OverrideSingleDto
  //) {
  //  return this.service.overrideSingle(assignmentId, dto);
  //}

  @Patch('override/:id')
async overrideSingle(
  @Param('id') id: number,
  @Body() dto: OverrideSingleDto
) {
  return this.service.overrideSingle(id, dto);
}


  /** 🔹 Mark as processed  */
  @Post('mark-processed/:assignmentId/:agentId')
  async markProcessed(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('agentId', ParseIntPipe) agentId: number,
  ) {
    return this.service.markProcessed(assignmentId, agentId);
  }
}
