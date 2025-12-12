import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PaymentHistoryService } from './paymenthistory.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('paymenthistory')
export class PaymentHistoryController {
  constructor(private readonly paymentHistoryService: PaymentHistoryService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':loanApplicationId')
  async getHistory(@Param('loanApplicationId') loanApplicationId: string) {
    return this.paymentHistoryService.getPaymentHistory(Number(loanApplicationId));
  }
}
