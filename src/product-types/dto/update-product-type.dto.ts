import { IsOptional } from 'class-validator';

export class UpdateProductTypeDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  isActive?: boolean;
}
