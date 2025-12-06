import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplatesService } from './email-templates.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(private readonly service: EmailTemplatesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('IT - CMS Admin', 'Execom - CEO')
  @Post()
  create(@Body() dto: CreateEmailTemplateDto) {
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('IT - CMS Admin', 'Execom - CEO')
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateEmailTemplateDto) {
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('IT - CMS Admin', 'Execom - CEO')
  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @UseGuards(RolesGuard)
  @Roles('IT - CMS Admin', 'Execom - CEO')
  @Patch(':id/activate')
  activate(@Param('id') id: number) {
    return this.service.activate(id);
  }

  @UseGuards(RolesGuard)
  @Roles('IT - CMS Admin', 'Execom - CEO')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: number) {
    return this.service.deactivate(id);
  }
}
