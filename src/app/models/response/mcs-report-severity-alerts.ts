import { JsonProperty } from '@app/utilities';

export class McsReportSeverityAlerts {
  @JsonProperty()
  public severity: number = undefined;

  @JsonProperty()
  public totalAlerts: number = undefined;

  @JsonProperty()
  public description: string = undefined;
}