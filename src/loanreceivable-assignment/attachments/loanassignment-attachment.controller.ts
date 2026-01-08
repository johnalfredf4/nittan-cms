import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LoanAssignmentAttachmentService } from './loanassignment-attachment.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import type { Express } from 'express';


@Controller('loanassignment-attachments')
export class LoanAssignmentAttachmentController {
  constructor(
    private readonly service: LoanAssignmentAttachmentService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Body() dto: CreateAttachmentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.upload(dto, file);
  }

  @Get('snapshot/:personalSnapshotId')
  findBySnapshot(
    @Param('personalSnapshotId', ParseIntPipe)
    personalSnapshotId: number,
  ) {
    return this.service.findBySnapshot(personalSnapshotId);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}


