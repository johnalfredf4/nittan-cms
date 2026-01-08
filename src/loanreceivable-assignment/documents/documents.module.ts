import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { S3Service } from './s3.service';
import { LoanAssignmentDocument } from './entities/loan-assignment-document.entity';
import { DocumentRequirement } from './entities/document-requirement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentDocument, DocumentRequirement],
      'nittan_app',
    ),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, S3Service],
  exports: [DocumentsService],
})
export class DocumentsModule {}


