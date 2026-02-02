import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LoanAssignmentProcedure } from './entities/procedure.entity';
import { LoanAssignmentCTB } from './entities/procedure-ctb.entity';
import { LoanAssignmentProcedureDocument } from './entities/procedure-document.entity';

import { S3Service } from './s3.service';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(LoanAssignmentProcedure, 'nittan_app')
    private procedureRepo: Repository<LoanAssignmentProcedure>,

    @InjectRepository(LoanAssignmentCTB, 'nittan_app')
    private ctbRepo: Repository<LoanAssignmentCTB>,

    @InjectRepository(LoanAssignmentProcedureDocument, 'nittan_app')
    private docRepo: Repository<LoanAssignmentProcedureDocument>,

    private s3: S3Service,
  ) {}

  /* PROCEDURE */
  createProcedure(dto) {
    return this.procedureRepo.save(dto);
  }

  updateProcedure(id: number, dto) {
    return this.procedureRepo.update(id, dto);
  }

  deleteProcedure(id: number) {
    return this.procedureRepo.update(id, { isDeleted: true });
  }

  /* CTB */
  addCTB(dto) {
    return this.ctbRepo.save(dto);
  }

  deleteCTB(id: number) {
    return this.ctbRepo.update(id, { isDeleted: true });
  }

  /* DOCUMENTS */
  async uploadDocument(file, dto) {
    const key = `procedure-docs/${dto.procedureId}/${Date.now()}-${file.originalname}`;
    await this.s3.uploadFile(file, key);

    return this.docRepo.save({
      ...dto,
      s3Key: key,
    });
  }

  async downloadDocument(id: number) {
    const doc = await this.docRepo.findOneBy({ id, isDeleted: false });
    if (!doc) throw new NotFoundException('Document not found');

    return { url: await this.s3.getSignedDownloadUrl(doc.s3Key) };
  }

  deleteDocument(id: number) {
    return this.docRepo.update(id, { isDeleted: true });
  }
  
  async getByLoanAssignmentId(loanAssignmentId: number) {
	  return this.procedureRepo.findOne({
		where: {
		  loanAssignmentId,
		  isDeleted: false,
		},
		order: { createdAt: 'DESC' },
	  });
	}
	
 async getCTBList(procedureId: number) {
  return this.ctbRepo.find({
    where: {
      procedureId,
      isDeleted: false,
    },
    order: { createdAt: 'ASC' },
  });
}

	async getDocumentsByProcedure(procedureId: number) {
	  return this.docRepo.find({
		where: {
		  procedureId,
		  isDeleted: false,
		},
		order: { createdAt: 'ASC' },
	  });
	}

}
