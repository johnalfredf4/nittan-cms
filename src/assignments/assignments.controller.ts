import { Controller, Get, Req, UseGuards } from '@nestjs/common';
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
}
