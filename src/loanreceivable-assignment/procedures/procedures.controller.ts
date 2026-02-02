import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { ProceduresService } from './procedures.service';

@Controller('loanreceivable-assignment/procedures')
export class ProceduresController {
  constructor(private readonly service: ProceduresService) {}

  /* PROCEDURE */
  @Post()
  create(@Body() dto) {
    return this.service.createProcedure(dto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto) {
    return this.service.updateProcedure(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.service.deleteProcedure(id);
  }

  /* CTB */
  @Post('ctb')
  addCTB(@Body() dto) {
    return this.service.addCTB(dto);
  }

  @Delete('ctb/:id')
  deleteCTB(@Param('id') id: number) {
    return this.service.deleteCTB(id);
  }

  /* DOCUMENTS */
  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadDoc(@UploadedFile() file, @Body() dto) {
    return this.service.uploadDocument(file, dto);
  }

  @Get('documents/download/:id')
  downloadDoc(@Param('id') id: number) {
    return this.service.downloadDocument(id);
  }

  @Delete('documents/:id')
  deleteDoc(@Param('id') id: number) {
    return this.service.deleteDocument(id);
  }
}
