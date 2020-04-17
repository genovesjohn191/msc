import { JsonProperty } from '@peerlancers/json-serialization';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';

export class McsOrderBackupAggregationTargetAdd {

  @JsonProperty()
  public retentionPeriodDays: number = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public dailyBackupQuotaGB: number = undefined;
}
