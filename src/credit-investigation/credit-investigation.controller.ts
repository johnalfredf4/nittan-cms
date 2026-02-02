import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { CreditInvestigationService } from './credit-investigation.service';

import { CreateCreditInvestigationDto } from './dto/create-cir.dto';
import { UpdateCreditInvestigationDto } from './dto/update-cir.dto';
import { CreateCreditInvestigationCoBorrowerDto } from './dto/create-coborrower.dto';

@Controller('credit-investigation')
export class CreditInvestigationController {
  constructor(
    private readonly service: CreditInvestigationService,
  ) {}

  /* ===============================
     CREDIT INVESTIGATION REPORT
  =============================== */

  @Post()
  create(
    @Body() dto: CreateCreditInvestigationDto,
  ) {
    return this.service.create(dto);
  }
  
  @Get('by-user/:createdByUserId')
	getByCreatedByUser(
	  @Param('createdByUserId', ParseIntPipe) createdByUserId: number,
	) {
	  return this.service.findByCreatedByUserId(createdByUserId);
	}

  @Get(':id')
  get(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCreditInvestigationDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.remove(id);
  }

  /* ===============================
     CO-BORROWERS (1 : MANY)
  =============================== */

  @Post('co-borrower')
  addCoBorrower(
    @Body() dto: CreateCreditInvestigationCoBorrowerDto,
  ) {
    return this.service.addCoBorrower(dto);
  }

  @Get(':id/co-borrowers')
  getCoBorrowers(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.getCoBorrowers(id);
  }

  @Delete('co-borrower/:id')
  deleteCoBorrower(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.deleteCoBorrower(id);
  }
}
