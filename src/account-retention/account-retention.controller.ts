import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
} from '@nestjs/common';
import { AccountRetentionService } from './account-retention.service';
import { CreateRetentionDto } from './dto/create-retention.dto';
import { UpdateRetentionDto } from './dto/update-retention.dto';

@Controller('account-retention')
export class AccountRetentionController {
  constructor(private readonly service: AccountRetentionService) {}

  @Post()
  create(@Body() dto: CreateRetentionDto) {
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
  update(@Param('id') id: string, @Body() dto: UpdateRetentionDto) {
    return this.service.update(+id, dto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.service.toggleActive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
