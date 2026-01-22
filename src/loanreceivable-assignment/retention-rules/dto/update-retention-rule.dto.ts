import { PartialType } from '@nestjs/mapped-types';
import { CreateRetentionRuleDto } from './create-retention-rule.dto';

export class UpdateRetentionRuleDto extends PartialType(
  CreateRetentionRuleDto,
) {}
