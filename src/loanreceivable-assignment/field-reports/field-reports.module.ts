import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldReportsService } from './field-reports.service';
import { FieldReportsController } from './field-reports.controller';
import { LoanAssignmentFieldReport } from './entities/loan-assignment-field-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [LoanAssignmentFieldReport],
      'nittan_app',
    ),
  ],
  controllers: [FieldReportsController],
  providers: [FieldReportsService],
})
export class FieldReportsModule {}
