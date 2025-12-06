import { IsNotEmpty } from 'class-validator';

export class CreateProductTypeDto {
  @IsNotEmpty({ message: 'Product Type Name is required' })
  name: string;

  description?: string;
}
