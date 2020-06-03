import { JsonProperty } from '@app/utilities';
import {
  InviewLevel,
  InviewLevelSerialization
} from '../enumerations/inview-level.enum';

export class McsOrderServerBackupAdd {
  @JsonProperty()
  public backupAggregationTarget: string = undefined;

  @JsonProperty()
  public retentionPeriodDays: number = undefined;

  @JsonProperty({
    serializer: InviewLevelSerialization,
    deserializer: InviewLevelSerialization
  })
  public inviewLevel: InviewLevel = undefined;

  @JsonProperty()
  public dailySchedule: string = undefined;

  @JsonProperty()
  public dailyBackupQuotaGB: string = undefined;
}
