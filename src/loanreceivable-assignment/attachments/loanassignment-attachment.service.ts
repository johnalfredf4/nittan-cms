
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentAttachment } from '../snapshot/entities/loanassignment-attachment.entity';
import { LoanAssignmentPersonalSnapshot } from '../snapshot/entities/loanassignment-personal-snapshot.entity';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { uploadToS3 } from './s3-upload.util';
import type { Express } from 'express';

@Injectable()
export class LoanAssignmentAttachmentService {
  constructor(
    @InjectRepository(LoanAssignmentAttachment, 'nittan_app')
    private readonly attachmentRepo: Repository<LoanAssignmentAttachment>,

    @InjectRepository(LoanAssignmentPersonalSnapshot, 'nittan_app')
    private readonly snapshotRepo: Repository<LoanAssignmentPersonalSnapshot>,
  ) {}

  async upload(
    dto: CreateAttachmentDto,
    file: Express.Multer.File,
  ) {
    const snapshot = await this.snapshotRepo.findOne({
      where: { id: dto.personalSnapshotId },
    });

    if (!snapshot) {
      throw new NotFoundException('Personal snapshot not found');
    }

    const filePath = await uploadToS3(file);

    const attachment = this.attachmentRepo.create({
      snapshot,
      attachmentType: dto.attachmentType,
      filePath,
    });

    return this.attachmentRepo.save(attachment);
  }

  async findBySnapshot(personalSnapshotId: number) {
    return this.attachmentRepo.find({
      where: { snapshot: { id: personalSnapshotId } },
      order: { uploadedAt: 'DESC' },
    });
  }

  async delete(id: number) {
    const result = await this.attachmentRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Attachment not found');
    }

    return { ok: true };
  }
}




