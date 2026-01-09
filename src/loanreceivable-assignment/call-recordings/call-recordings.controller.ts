// call-recordings.controller.ts
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

import { CallRecordingsService } from './call-recordings.service';
import { TriggerCubeacrDto } from './dto/trigger-cubeacr.dto';
import { CreateCallRecordingDto } from './dto/create-call-recording.dto';
import { UpdateCallRecordingDto } from './dto/update-call-recording.dto';

@Controller('call-recordings')
export class CallRecordingsController {
  constructor(private readonly service: CallRecordingsService) {}

  @Post('trigger')
	triggerCubeacr(@Body() dto: TriggerCubeacrDto) {
	  return this.service.triggerCubeacr(dto);
	}


  @Post()
  create(@Body() dto: CreateCallRecordingDto) {
    return this.service.create(dto);
  }

  @Get('loan/:loanAssignmentId')
  listByLoan(
    @Param('loanAssignmentId', ParseIntPipe)
    loanAssignmentId: number,
  ) {
    return this.service.findByLoan(loanAssignmentId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCallRecordingDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
