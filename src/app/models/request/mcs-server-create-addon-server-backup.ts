import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnServerBackup {
  @JsonProperty()
  public aggregation: string = undefined;

  @JsonProperty()
  public retention: string = undefined;

  @JsonProperty()
  public inview: string = undefined;

  @JsonProperty()
  public backupSchedule: string = undefined;

  @JsonProperty()
  public dailyQuotaGb: number = undefined;

  @JsonProperty()
  public deDuplicationRatio: string = undefined;

  @JsonProperty()
  public databaseSupport: string = undefined;
}
