import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnServerBackup {
  @JsonProperty()
  public backupAggregationTarget: string = undefined;

  @JsonProperty()
  public retentionPeriodDays: string = undefined;

  @JsonProperty()
  public inviewLevel: string = undefined;

  @JsonProperty()
  public dailySchedule: string = undefined;

  @JsonProperty()
  public dailyBackupQuotaGB: number = undefined;
}
