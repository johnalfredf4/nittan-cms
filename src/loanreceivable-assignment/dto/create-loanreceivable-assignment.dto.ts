export class CoBorrowerDto {
    personId: number;
    relationshipId?: number;
    order: 1 | 2 | 3;
}

export class CreateLoanReceivableAssignmentDto {
    borrowerId: number;
    coBorrowers?: CoBorrowerDto[];
}
