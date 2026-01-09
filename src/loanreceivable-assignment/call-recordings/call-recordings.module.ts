// call-recordings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CallRecordingsController } from './call-recordings.controller';
import { CallRecordingsService } from './call-recordings.service';
import { LoanAssignmentCallRecording } from './entities/loanassignment-call-recording.entity';
import { LoanReceivableAssignment } from '../entities/loanreceivable-assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentCallRecording, LoanReceivableAssignment],
      'nittan_app',
    ),
  ],
  controllers: [CallRecordingsController],
  providers: [CallRecordingsService],
})
export class CallRecordingsModule {}
