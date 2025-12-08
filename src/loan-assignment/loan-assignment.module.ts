import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanAssignmentService } from './loan-assignment.service';
import { LoanAssignmentController } from './loan-assignment.controller';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';

@Module({
  imports: [
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
})
export class LoanAssignmentModule {}
