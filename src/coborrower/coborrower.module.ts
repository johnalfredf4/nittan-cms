import { Module } from '@nestjs/common';
import { CoBorrowerService } from './coborrower.service';
import { CoBorrowerController } from './coborrower.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'nittan'), // raw SQL, no entities needed
  ],
  controllers: [CoBorrowerController],
  providers: [CoBorrowerService],
})
export class CoBorrowerModule {}
