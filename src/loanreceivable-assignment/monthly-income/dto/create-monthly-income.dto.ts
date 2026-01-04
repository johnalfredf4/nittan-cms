import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMonthlyIncomeDto {
    @ApiProperty()
    @IsNumber()
    personalSnapshotId: number;

    @ApiProperty()
    @IsString()
    incomeType: string;

    @ApiProperty()
    @IsNumber()
    amount: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bankName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    bankBranch?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    accountNumber?: string;
}
