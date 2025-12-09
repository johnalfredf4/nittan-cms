// src/loanreceivable-assignment/types.ts
export type LocationType = 'HQ' | 'BRANCH';

export type DpdCategory =
  | 'DPD_0'
  | 'DPD_1_30'
  | 'DPD_31_60'
  | 'DPD_61_90'
  | 'DPD_91_120'
  | 'DPD_121_150'
  | 'DPD_151_180'
  | 'DPD_181_UP';

export interface RawReceivableRow {
  LoanReceivableId: number;
  LoanApplicationId: number;
  DueDate: Date | string;
  DPD: number;
  BranchId: number | null;
  DPDCategory: DpdCategory;
  RetentionDays: number;
}
