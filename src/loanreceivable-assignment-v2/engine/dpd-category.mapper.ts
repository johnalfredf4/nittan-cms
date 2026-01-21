import { RetentionRule } from '../entities/retention-rule.entity';


export function mapDpdToCategory(dpd: number, rules: RetentionRule[]) {
return rules.find(r =>
r.isActive &&
dpd >= r.minDpd &&
(r.maxDpd === null || dpd <= r.maxDpd),
);
}