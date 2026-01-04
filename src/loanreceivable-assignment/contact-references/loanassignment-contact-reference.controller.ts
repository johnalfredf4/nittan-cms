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

import { LoanAssignmentContactReferenceService } from './loanassignment-contact-reference.service';
import { CreateContactReferenceDto } from './dto/create-contact-reference.dto';
import { UpdateContactReferenceDto } from './dto/update-contact-reference.dto';

@Controller('loanassignment-contact-references')
export class LoanAssignmentContactReferenceController {
  constructor(
    private readonly service: LoanAssignmentContactReferenceService,
  ) {}

  @Post()
  create(@Body() dto: CreateContactReferenceDto) {
    return this.service.create(dto);
  }

  @Get('snapshot/:personalSnapshotId')
  findBySnapshot(
    @Param('personalSnapshotId', ParseIntPipe)
    personalSnapshotId: number,
  ) {
    return this.service.findBySnapshot(personalSnapshotId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactReferenceDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
