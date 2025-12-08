import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanAssignmentService } from './loan-assignment.service';
import { LoanAssignmentController } from './loan-assignment.controller';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { User } from './users/entities/user.entity'; // ADD THIS

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // REGISTER WRITE DB REPOSITORIES HERE
    TypeOrmModule.forFeature(
      [LoanAssignment, RotationState],
      'nittan_app',
    ),

    // REGISTER READ DB CONNECTION HERE (NO ENTITIES)
    TypeOrmModule.forFeature([], 'nittan'),
  ],
  providers: [LoanAssignmentService],
  controllers: [LoanAssignmentController],
  exports: [LoanAssignmentService],
})
export class LoanAssignmentModule {}
