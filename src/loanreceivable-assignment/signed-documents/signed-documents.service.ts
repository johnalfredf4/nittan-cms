import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanAssignmentDocument } from './entities/loan-assignment-document.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { S3Service } from './s3.service';

@Injectable()
export class SignedDocumentsService {
  constructor(
    @InjectRepository(LoanAssignmentDocument, 'nittan_app')
    private readonly repo: Repository<LoanAssignmentDocument>,
    private readonly s3Service: S3Service,
  ) {}

  /* ===============================
     LIST DOCUMENTS
  =============================== */
  async findByAssignment(loanAssignmentId: number) {
    return this.repo.find({
      where: { loanAssignmentId, isDeleted: false },
      order: { createdAt: 'ASC' },
    });
  }

  /* ===============================
     UPLOAD DOCUMENT
  =============================== */
  async upload(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    const s3Key = `loan-documents/${dto.loanAssignmentId}/${Date.now()}-${file.originalname}`;

    await this.s3Service.uploadFile(file, s3Key);

    return this.repo.save({
      ...dto,
      s3Key,
      status: 'SIGNED',
      signedAt: new Date(),
    });
  }

  /* ===============================
     DOWNLOAD (SIGNED URL)
  =============================== */
  async getDownloadUrl(id: number) {
    const doc = await this.repo.findOneBy({ id, isDeleted: false });
    if (!doc) throw new NotFoundException('Document not found');

    return {
      url: await this.s3Service.getSignedDownloadUrl(doc.s3Key),
    };
  }

  /* ===============================
     UPDATE METADATA
  =============================== */
  async update(id: number, dto: UpdateDocumentDto) {
    const doc = await this.repo.findOneBy({ id, isDeleted: false });
    if (!doc) throw new NotFoundException('Document not found');

    Object.assign(doc, dto);

    if (dto.status === 'SIGNED') {
      doc.signedAt = new Date();
    }

    return this.repo.save(doc);
  }

  /* ===============================
     DELETE (SOFT)
  =============================== */
  async remove(id: number) {
    const doc = await this.repo.findOneBy({ id, isDeleted: false });
    if (!doc) throw new NotFoundException('Document not found');

    doc.isDeleted = true;
    return this.repo.save(doc);
  }
}
