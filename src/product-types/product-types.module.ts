import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from './entities/product-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductType], 'nittan_app'), // 👈 IMPORTANT FIX
  ],
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
  exports: [ProductTypesService], // 👈 recommended to export
})
export class ProductTypesModule {}
