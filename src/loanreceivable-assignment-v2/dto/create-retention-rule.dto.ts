export class CreateRetentionRuleDto {
categoryCode: string;
minDpd: number;
maxDpd?: number;
retentionDays?: number;
label: string;
}