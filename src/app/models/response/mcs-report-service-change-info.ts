import { JsonProperty } from '@app/utilities';

export class McsReportServiceChangeInfo {
  @JsonProperty()
  public serviceName: string = undefined;

  @JsonProperty()
  public serviceCountChange: number = undefined;

  @JsonProperty()
  public serviceCostChange: number = undefined;
}
