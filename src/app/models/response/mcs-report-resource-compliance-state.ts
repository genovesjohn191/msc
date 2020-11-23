import { JsonProperty } from '@app/utilities';

export class McsReportResourceComplianceState {
  @JsonProperty()
  public state: string = undefined;

  @JsonProperty()
  public count: number = undefined;
}