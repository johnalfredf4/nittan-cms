import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';


@Injectable()
export class NittanService {
constructor(
@InjectDataSource('nittan')
private readonly dataSource: DataSource,
) {}


async fetchReceivables() {
return this.dataSource.query(`
SELECT
ID,
LoanApplicationId,
DueDate,
DATEDIFF(DAY, DueDate, GETDATE()) AS DPD
FROM Nittan.dbo.tblLoanReceivables
WHERE Cleared = 0
`);
}
}