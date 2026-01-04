import { PartialType } from '@nestjs/swagger';
import { CreateMonthlyIncomeDto } from './create-monthly-income.dto';

export class UpdateMonthlyIncomeDto extends PartialType(
    CreateMonthlyIncomeDto,
) { }
