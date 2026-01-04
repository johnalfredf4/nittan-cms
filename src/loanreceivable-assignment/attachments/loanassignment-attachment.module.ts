import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAssignmentAttachment } from '../snapshot/entities/loanassignment-attachment.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';
import { LoanAssignmentAttachmentController } from './loanassignment-attachment.controller';
import { LoanAssignmentAttachmentService } from './loanassignment-attachment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentAttachment, LoanAssignmentPersonalSnapshot],
      'nittan_app',
    ),
  ],
  controllers: [LoanAssignmentAttachmentController],
  providers: [LoanAssignmentAttachmentService],
})
export class LoanAssignmentAttachmentModule {}
