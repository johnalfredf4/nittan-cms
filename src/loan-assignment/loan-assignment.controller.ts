import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { LoanAssignmentService } from './loan-assignment.service';
import { OverrideAssignmentDto } from './dto/override-assignment.dto';
import { BulkOverrideAssignmentDto } from './dto/bulk-override-assignment.dto';

@Controller('loan-assignments')
export class LoanAssignmentController {
  constructor(private readonly service: LoanAssignmentService) {}

  @Get('my-queue')
  async getQueue(@Req() req) {
    return this.service.getAgentQueue(req.user.id);
  }

  @Patch('override')
  async override(@Body() dto: OverrideAssignmentDto) {
    return this.service.overrideAssignment(dto);
  }

  @Patch('bulk-override')
  async bulkOverride(@Body() dto: BulkOverrideAssignmentDto) {
    return this.service.bulkOverride(dto);
  }

  // -----------------------------------------------------
  // Get ALL assignments
  // -----------------------------------------------------
  @Get('all')
  async getAllAssignments() {
    return this.service.getAllAssignments();
  }

  // -----------------------------------------------------
  // Get assignments of specific agent
  // -----------------------------------------------------
  @Get('agent/:agentId')
  async getAssignmentsForAgent(@Param('agentId') agentId: number) {
    return this.service.getAgentQueue(Number(agentId));
  }

  // -----------------------------------------------------
  // Get agent list for dropdown
  // -----------------------------------------------------
  @Get('agents')
  async getAgents() {
    return this.service.getAgentsList();
  }

  // -----------------------------------------------------
  // Reassign a single loan to another agent
  // -----------------------------------------------------
  @Patch('reassign/:id')
  async reassign(
    @Param('id') assignmentId: number,
    @Body() dto: { newAgentId: number },
  ) {
    return this.service.overrideAssignment({
      assignmentId,
      newAgentId: dto.newAgentId,
    });
  }

}
