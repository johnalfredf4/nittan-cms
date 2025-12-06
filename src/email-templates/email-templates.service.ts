import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

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

  create(dto: CreateEmailTemplateDto) {
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
}

