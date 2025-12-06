import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';

@Controller('sms-templates')
export class SmsTemplatesController {
  constructor(private readonly service: SmsTemplatesService) {}

  @Post()
  create(@Body() dto: CreateSmsTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSmsTemplateDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
