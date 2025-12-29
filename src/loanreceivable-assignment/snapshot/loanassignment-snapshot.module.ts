// snapshot/loan-assignment-snapshot.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        LoanAssignmentPersonalSnapshot,
        LoanAssignmentIdentification,
        LoanAssignmentMonthlyIncome,
        LoanAssignmentMonthlyExpense,
        LoanAssignmentContactReference,
      ],
      'nittan_app',
    ),

    TypeOrmModule.forFeature([], 'nittan'),
  ],
  providers: [LoanAssignmentPersonalSnapshotService],
  exports: [LoanAssignmentPersonalSnapshotService], // 🔑 REQUIRED
})
export class LoanAssignmentSnapshotModule {}