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
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { LoanAssignmentMonthlyIncomeService } from './loanassignment-monthly-income.service';
import { CreateMonthlyIncomeDto } from './dto/create-monthly-income.dto';
import { UpdateMonthlyIncomeDto } from './dto/update-monthly-income.dto';

@ApiTags('Loan Assignment - Monthly Income')
@Controller('loanassignment-monthly-income')
export class LoanAssignmentMonthlyIncomeController {
    constructor(
        private readonly service: LoanAssignmentMonthlyIncomeService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Add monthly income' })
    create(@Body() dto: CreateMonthlyIncomeDto) {
        return this.service.create(dto);
    }

    @Get('snapshot/:personalSnapshotId')
    @ApiOperation({ summary: 'Get monthly income by personal snapshot' })
    findBySnapshot(
        @Param('personalSnapshotId', ParseIntPipe) personalSnapshotId: number,
    ) {
        return this.service.findBySnapshot(personalSnapshotId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update monthly income' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMonthlyIncomeDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete monthly income' })
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.service.delete(id);
    }
}
