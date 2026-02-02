import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProceduresService } from './procedures.service';
import { ProceduresController } from './procedures.controller';

import { LoanAssignmentProcedure } from './entities/procedure.entity';
import { LoanAssignmentCTB } from './entities/procedure-ctb.entity';
import { LoanAssignmentProcedureDocument } from './entities/procedure-document.entity';

import { S3Service } from './s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        LoanAssignmentProcedure,
        LoanAssignmentCTB,
        LoanAssignmentProcedureDocument,
      ],
      'nittan_app',
    ),
  ],
  controllers: [ProceduresController],
  providers: [ProceduresService, S3Service],
})
export class ProceduresModule {}
