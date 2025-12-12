import { Module } from '@nestjs/common';
import { PaymentHistoryService } from './paymenthistory.service';
import { PaymentHistoryController } from './paymenthistory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'nittan'), // Using raw SQL only
  ],
  controllers: [PaymentHistoryController],
  providers: [PaymentHistoryService],
})
export class PaymentHistoryModule {}
