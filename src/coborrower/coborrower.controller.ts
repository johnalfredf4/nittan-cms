import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CoBorrowerService } from './coborrower.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('coborrower')
export class CoBorrowerController {
  constructor(private readonly coBorrowerService: CoBorrowerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getCoBorrower(@Param('id') id: string) {
    return this.coBorrowerService.getCoBorrowerById(Number(id));
  }
}
