import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreditInvestigationController } from './credit-investigation.controller';
import { CreditInvestigationService } from './credit-investigation.service';

import { CreditInvestigationReport } from './entities/credit-investigation.entity';
import { CreditInvestigationCoBorrower } from './entities/credit-investigation-coborrower.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
	  [
		CreditInvestigationReport,
		CreditInvestigationCoBorrower,
	  ],
	  'nittan_app', // ✅ IMPORTANT
	),
  ],
  controllers: [CreditInvestigationController],
  providers: [CreditInvestigationService],
  exports: [CreditInvestigationService], // optional but future-proof
})
export class CreditInvestigationModule {}
