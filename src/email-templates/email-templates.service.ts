import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplateVersion } from './entities/email-template-version.entity';

@Injectable()
export class EmailTemplatesService {
  constructor(
    @InjectRepository(EmailTemplate)
    private readonly repo: Repository<EmailTemplate>,

    @InjectRepository(EmailTemplateVersion)
    private readonly versionRepo: Repository<EmailTemplateVersion>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
  
  async create(dto: CreateEmailTemplateDto) {
    if (!dto.code) {
      throw new Error("Template Code is required");
    }
  
    const data = this.repo.create(dto);
    return this.repo.save(data);
  }


  async update(id: number, dto: UpdateEmailTemplateDto) {
    const existing = await this.repo.findOne({ where: { id } });

    if (!existing) {
      throw new Error("Template not found");
    }

    // Save old version
    await this.versionRepo.save({
      TemplateId: id,
      Subject: existing.subject,
      Body: existing.body,
    });

    return this.repo.update(id, dto);
  }
  remove(id: number) {
  return this.repo.update(id, { status: 'DELETED' });
  }
  
  activate(id: number) {
    return this.repo.update(id, { status: 'ACTIVE' });
  }
  
  deactivate(id: number) {
    return this.repo.update(id, { status: 'INACTIVE' });
  }
}

