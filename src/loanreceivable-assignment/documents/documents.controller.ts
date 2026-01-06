import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';

@Controller('loanreceivable-assignments')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // UI list: all master requirements + existing doc per assignment
  @Get(':assignmentId/documents')
  async list(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
  ) {
    return this.documentsService.listByLoanReceivableAssignment(assignmentId);
  }

  // Upload file for a requirement (multipart/form-data: field "file")
  @Post(':assignmentId/documents/:requirementId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('requirementId', ParseIntPipe) requirementId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentsService.upload(assignmentId, requirementId, file);
  }

  // Download signed url + filename
  @Get('documents/:id/download')
  async download(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.download(id);
  }

  // View (alias of download)
  @Get('documents/:id/view')
  async view(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.view(id);
  }

  // Delete document (reset)
  @Delete('documents/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }

  // Admin: create requirement
  @Post('documents/requirements')
  async createRequirement(@Body() payload: CreateRequirementDto) {
    return this.documentsService.createRequirement(payload);
  }

  // Admin: list requirements
  @Get('documents/requirements')
  async listRequirements() {
    return this.documentsService.listRequirements();
  }
}
