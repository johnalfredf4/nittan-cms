import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoanAssignmentDocument } from './entities/loan-assignment-document.entity';
import { S3Service } from './s3.service';
import { DocumentRequirement } from './entities/document-requirement.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(LoanAssignmentDocument, 'nittan_app')
    private readonly docRepo: Repository<LoanAssignmentDocument>,

    @InjectRepository(DocumentRequirement, 'nittan_app')
    private readonly reqRepo: Repository<DocumentRequirement>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  // List for UI: returns all requirements and any existing uploaded doc for the given assignment
  async listByLoanReceivableAssignment(assignmentId: number) {
    return this.dataSource.query(
      `
      SELECT 
        dr.id AS requirementId,
        dr.name AS documentName,
        ISNULL(lad.status, 'PENDING') AS status,
        lad.dateSubmitted,
        lad.id AS documentId,
        lad.originalFilename
      FROM Document_Requirements dr
      LEFT JOIN Loan_Assignment_Documents lad
        ON dr.id = lad.documentRequirementId
       AND lad.loanReceivableAssignmentId = @0
      ORDER BY dr.id
      `,
      [assignmentId],
    );
  }

  // Upload or replace document for the requirement
  async upload(
    assignmentId: number,
    requirementId: number,
    file: Express.Multer.File,
  ) {
    // basic key: can be adjusted for folders / versioning
    const key = `uploads/loan-receivable/${assignmentId}/${Date.now()}-${file.originalname}`;

    // upload to S3
    await this.s3Service.uploadFile(file, key);

    // find existing record
    let doc = await this.docRepo.findOne({
      where: {
        loanReceivableAssignmentId: assignmentId,
        documentRequirementId: requirementId,
      },
    });

    if (!doc) {
      doc = this.docRepo.create({
        loanReceivableAssignmentId: assignmentId,
        documentRequirementId: requirementId,
      });
    }

    doc.status = 'SUBMITTED';
    doc.dateSubmitted = new Date();
    doc.originalFilename = file.originalname;
    doc.s3Bucket = this.s3Service['bucket'];
    doc.s3Key = key;
    doc.mimeType = file.mimetype;
    doc.fileSize = file.size;

     // 🔴 6. THIS IS THE CRITICAL LINE
    const saved = await this.docRepo.save(doc);
  
    // 🔴 7. MUST RETURN
    return saved;
  }

  async download(documentId: number) {
    const doc = await this.docRepo.findOneBy({ id: documentId });
    if (!doc) throw new NotFoundException('Document not found');

    const url = await this.s3Service.getSignedDownloadUrl(doc.s3Key);
    return {
      url,
      filename: doc.originalFilename,
    };
  }

  // view (same as download; client can open inline)
  async view(documentId: number) {
    return this.download(documentId);
  }

  // delete record (does not delete S3 object by default — implement if you want)
  async remove(documentId: number) {
    const doc = await this.docRepo.findOneBy({ id: documentId });
    if (!doc) throw new NotFoundException('Document not found');

    await this.docRepo.remove(doc);
    return { success: true };
  }

  // Admin: create/update requirement
  async createRequirement(payload: { name: string; description?: string; isRequired?: boolean }) {
    const r = this.reqRepo.create({
      name: payload.name,
      description: payload.description ?? null,
      isRequired: payload.isRequired ?? true,
    });
    return this.reqRepo.save(r);
  }

  async listRequirements() {
    return this.reqRepo.find({ order: { id: 'ASC' } });
  }
}



