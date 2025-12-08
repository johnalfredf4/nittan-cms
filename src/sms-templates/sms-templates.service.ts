import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { SmsTemplate } from './entities/sms-template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';

@Injectable()
export class SmsTemplatesService {
 constructor(
  @InjectRepository(SmsTemplate, 'default')
  private smsRepo: Repository<SmsTemplate>,
) {}


  async create(dto: CreateSmsTemplateDto) {
    const template = this.smsRepo.create(dto);
    return await this.smsRepo.save(template);
  }

  async findAll() {
    return await this.smsRepo.find();
  }

  async findOne(id: number) {
    const template = await this.smsRepo.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async update(id: number, dto: UpdateSmsTemplateDto) {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return await this.smsRepo.save(template);
  }

  async remove(id: number) {
    const template = await this.findOne(id);
    return await this.smsRepo.remove(template);
  }

  async toggleActive(id: number) {
    const template = await this.findOne(id);
    template.isActive = !template.isActive;
    return await this.smsRepo.save(template);
  }
}
