import { Controller, Get, Req, UseGuards, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAssignments(@Req() req: any) {
    const employeeId = req.user.employeeId; // from JWT
    return await this.assignmentsService.getByEmployee(employeeId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('by-receivable/:loanReceivableId')
  async getByLoanReceivableId(@Req() req: any, @Param('loanReceivableId') loanReceivableId: string) {
    return this.assignmentsService.getByLoanReceivableId(Number(loanReceivableId));
  }

}
