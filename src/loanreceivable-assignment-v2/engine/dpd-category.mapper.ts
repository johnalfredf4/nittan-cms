import { RetentionRuleV2 } from '../entities/retention-rule-v2.entity';

export function mapRetentionRule(
  dpd: number,
  rules: RetentionRuleV2[],
): RetentionRuleV2 | null {
  return (
    rules.find(
      r =>
        r.isActive &&
        dpd >= r.dpdMin &&
        (r.dpdMax === null || dpd <= r.dpdMax),
    ) || null
  );
}
