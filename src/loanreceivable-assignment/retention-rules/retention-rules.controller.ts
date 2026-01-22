import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RetentionRulesService } from './retention-rules.service';
import { CreateRetentionRuleDto } from './dto/create-retention-rule.dto';
import { UpdateRetentionRuleDto } from './dto/update-retention-rule.dto';
import { QueryRetentionRuleDto } from './dto/query-retention-rule.dto';

@Controller('loanreceivable-assignment/retention-rules')
export class RetentionRulesController {
  constructor(private readonly service: RetentionRulesService) {}

  @Post()
  create(@Body() dto: CreateRetentionRuleDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryRetentionRuleDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRetentionRuleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/toggle')
  toggle(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.service.toggle(id, isActive);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
