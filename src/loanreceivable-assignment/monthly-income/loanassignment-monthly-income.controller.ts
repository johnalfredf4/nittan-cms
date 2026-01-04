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

import { LoanAssignmentMonthlyIncomeService } from './loanassignment-monthly-income.service';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@Controller('loanassignment-monthly-income')
export class LoanAssignmentMonthlyIncomeController {
  constructor(private readonly service: LoanAssignmentMonthlyIncomeService) {}

  @Post()
  create(@Body() dto: CreateMonthlyIncomeDto) {
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
    @Body() dto: UpdateMonthlyIncomeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}


