import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { LoanAssignmentIdentificationService } from './loanassignment-identification.service';
import { CreateIdentificationDto } from './dto/create-identification.dto';
import { UpdateIdentificationDto } from './dto/update-identification.dto';

@Controller('loanassignment-identifications')
export class LoanAssignmentIdentificationController {
  constructor(
    private readonly service: LoanAssignmentIdentificationService,
  ) {}

  @Post()
  create(@Body() dto: CreateIdentificationDto) {
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
    @Body() dto: UpdateIdentificationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
