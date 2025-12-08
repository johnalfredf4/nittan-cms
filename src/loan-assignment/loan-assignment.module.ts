import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanAssignment } from './entities/loan-assignment.entity';
import { RotationState } from './entities/rotation-state.entity';
import { LoanAssignmentService } from './loan-assignment.service';
import { LoanAssignmentController } from './loan-assignment.controller';

@Module({
  imports: [
    // ✅ Uses DEFAULT connection (Nittan_App)
    TypeOrmModule.forFeature([LoanAssignment, RotationState]),

    // ✅ Attach the Nittan connection so we can @InjectDataSource('nittan')
    TypeOrmModule.forFeature([], 'nittan'),
  ],
  providers: [LoanAssignmentService],
  controllers: [LoanAssignmentController],
})
export class LoanAssignmentModule {}
