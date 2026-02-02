import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SignedDocumentsService } from './signed-documents.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('loanreceivable-assignment/signed-documents')
export class SignedDocumentsController {
  constructor(private readonly service: SignedDocumentsService) {}

  @Get(':loanAssignmentId')
  list(
    @Param('loanAssignmentId', ParseIntPipe) loanAssignmentId: number,
  ) {
    return this.service.findByAssignment(loanAssignmentId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.service.upload(file, dto);
  }

  @Get('download/:id')
  download(@Param('id', ParseIntPipe) id: number) {
    return this.service.getDownloadUrl(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
