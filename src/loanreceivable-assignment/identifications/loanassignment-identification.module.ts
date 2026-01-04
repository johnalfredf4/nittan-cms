import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoanAssignmentIdentification } from '../snapshot/entities/loanassignment-identification.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';

import { LoanAssignmentIdentificationService } from './loanassignment-identification.service';
import { LoanAssignmentIdentificationController } from './loanassignment-identification.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        LoanAssignmentIdentification,
        LoanAssignmentPersonalSnapshot,
      ],
      'nittan_app',
    ),
  ],
  controllers: [LoanAssignmentIdentificationController],
  providers: [LoanAssignmentIdentificationService],
})
export class LoanAssignmentIdentificationModule {}
