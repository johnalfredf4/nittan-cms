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
    private repo: Repository<EmailTemplate>,
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

  update(id: number, dto: UpdateEmailTemplateDto) {
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
