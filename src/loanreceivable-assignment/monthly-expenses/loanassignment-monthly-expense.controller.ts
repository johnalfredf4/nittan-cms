import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { LoanAssignmentMonthlyExpenseService } from './loanassignment-monthly-expense.service';
import { CreateMonthlyExpenseDto } from './dto/create-monthly-expense.dto';
import { UpdateMonthlyExpenseDto } from './dto/update-monthly-expense.dto';

@Controller('loanassignment-monthly-expense')
export class LoanAssignmentMonthlyExpenseController {
  constructor(
    private readonly service: LoanAssignmentMonthlyExpenseService,
  ) {}

  @Post()
  create(@Body() dto: CreateMonthlyExpenseDto) {
    return this.service.create(dto);
  }

  @Get('snapshot/:personalSnapshotId')
  findBySnapshot(
    @Param('personalSnapshotId', ParseIntPipe) personalSnapshotId: number,
  ) {
    return this.service.findBySnapshot(personalSnapshotId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMonthlyExpenseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
