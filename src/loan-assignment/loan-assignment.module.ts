import { Module } from '@nestjs/common';
import { LoanAssignmentService } from './loan-assignment.service';
import { LoanAssignmentController } from './loan-assignment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([LoanAssignment, RotationState], 'nittan_app'),
    TypeOrmModule.forFeature([], 'nittan'), // read-only source DB
  ],
  providers: [LoanAssignmentService],
  controllers: [LoanAssignmentController],
})
export class LoanAssignmentModule {}
