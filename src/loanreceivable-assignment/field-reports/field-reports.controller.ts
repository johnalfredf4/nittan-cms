import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FieldReportsService } from './field-reports.service';
import { CreateFieldReportDto } from './dto/create-field-report.dto';
import { UpdateFieldReportDto } from './dto/update-field-report.dto';

@Controller('loanreceivable-assignment/field-reports')
export class FieldReportsController {
  constructor(private readonly service: FieldReportsService) {}

  /* ===============================
     GET LATEST REPORT
  =============================== */
  @Get(':loanAssignmentId')
  getLatest(
    @Param('loanAssignmentId', ParseIntPipe) loanAssignmentId: number,
  ) {
    return this.service.getLatest(loanAssignmentId);
  }

  /* ===============================
     CREATE
  =============================== */
  @Post()
  create(@Body() dto: CreateFieldReportDto) {
    return this.service.create(dto);
  }

  /* ===============================
     UPDATE
  =============================== */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFieldReportDto,
  ) {
    return this.service.update(id, dto);
  }

  /* ===============================
     DELETE
  =============================== */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
