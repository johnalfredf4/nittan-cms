import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRetentionDto {
  @IsNotEmpty({ message: 'Account Class is required' })
  accountClass: string;

  description?: string;

  @IsInt({ message: 'Retention days must be a number' })
  retentionDays: number;
}
