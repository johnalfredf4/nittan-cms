import { RetentionRuleV2 } from '../entities/retention-rule-v2.entity';

/**
 * Maps a DPD number to the correct active retention rule
 * using CMS-controlled ranges from LoanRetentionRules
 */
export function mapRetentionRule(
  dpd: number,
  rules: RetentionRuleV2[],
): RetentionRuleV2 | null {
  return (
    rules.find(r =>
      r.isActive &&
      dpd >= r.dpdMin &&
      (r.dpdMax === null || dpd <= r.dpdMax),
    ) || null
  );
}
