import { JsonProperty } from '@peerlancers/json-serialization';

export class McsServerCreateAddOnVmBackup {
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
}
