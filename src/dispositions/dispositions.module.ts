import { Module } from '@nestjs/common';
import { DispositionCategoriesController } from './disposition-categories.controller';
import { DispositionsController } from './dispositions.controller';
import { DispositionsService } from './dispositions.service';
import { DispositionCategoriesService } from './disposition-categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DispositionCategory } from './entities/disposition-category.entity';
import { Disposition } from './entities/disposition.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [DispositionCategory, Disposition],
      'nittan_app',  // 👈 REQUIRED FIX
    ),
  ],
  controllers: [
    DispositionCategoriesController,
    DispositionsController,
  ],
  providers: [
    DispositionsService,
    DispositionCategoriesService,
  ],
  exports: [
    DispositionsService,
    DispositionCategoriesService,
  ], // 👈 Recommended
})
export class DispositionsModule {}
