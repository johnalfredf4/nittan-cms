// call-recordings.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentCallRecording } from './entities/loanassignment-call-recording.entity';
import { LoanReceivableAssignment } from '../entities/loanreceivable-assignment.entity';
import { TriggerCubeacrDto } from './dto/trigger-cubeacr.dto';
import { CreateCallRecordingDto } from './dto/create-call-recording.dto';
import { UpdateCallRecordingDto } from './dto/update-call-recording.dto';
import { createCubeacrTxt } from './utils/cubeacr-txt-writer.util';

@Injectable()
export class CallRecordingsService {
  constructor(
    @InjectRepository(LoanAssignmentCallRecording, 'nittan_app')
    private readonly repo: Repository<LoanAssignmentCallRecording>,

    @InjectRepository(LoanReceivableAssignment, 'nittan_app')
    private readonly assignmentRepo: Repository<LoanReceivableAssignment>,
  ) {}

  // call-recordings.service.ts
	triggerCubeacr(dto: TriggerCubeacrDto) {
	  const txtFileName = createCubeacrTxt(
		dto.borrowerName,
		dto.loanAssignmentId,
		dto.mobileNumber,
	  );

	  return {
		txtFileName,
		ok: true,
	  };
	}

  async create(dto: CreateCallRecordingDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: dto.loanAssignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Loan assignment not found');
    }

    const record = this.repo.create({
      loanAssignment: assignment,
      ...dto,
    });

    return this.repo.save(record);
  }

  findByLoan(loanAssignmentId: number) {
    return this.repo.find({
      where: { loanAssignment: { id: loanAssignmentId } },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateCallRecordingDto) {
    const result = await this.repo.update(id, dto);
    if (!result.affected) {
      throw new NotFoundException('Recording not found');
    }
    return { ok: true };
  }

  async delete(id: number) {
    const result = await this.repo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Recording not found');
    }
    return { ok: true };
  }
}
