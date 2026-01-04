import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAssignmentContactReference } from '../snapshot/entities/loanassignment-contact-reference.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';
import { LoanAssignmentContactReferenceController } from './loanassignment-contact-reference.controller';
import { LoanAssignmentContactReferenceService } from './loanassignment-contact-reference.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentContactReference, LoanAssignmentPersonalSnapshot],
      'nittan_app',
    ),
  ],
  controllers: [LoanAssignmentContactReferenceController],
  providers: [LoanAssignmentContactReferenceService],
})
export class LoanAssignmentContactReferenceModule {}
