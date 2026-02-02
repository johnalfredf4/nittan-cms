import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignedDocumentsController } from './signed-documents.controller';
import { SignedDocumentsService } from './signed-documents.service';
import { LoanAssignmentDocument } from './entities/loan-assignment-document.entity';
import { S3Service } from './s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentDocument],
      'nittan_app',
    ),
  ],
  controllers: [SignedDocumentsController],
  providers: [SignedDocumentsService, S3Service],
})
export class SignedDocumentsModule {}
