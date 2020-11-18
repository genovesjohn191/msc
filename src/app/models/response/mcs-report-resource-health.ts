import { JsonProperty } from '@app/utilities';

export class McsReportResourceHealth {
  @JsonProperty()
  public healthyResourceCount: number = undefined;

  @JsonProperty()
  public unhealthyResourceCount: number = undefined;

  @JsonProperty()
  public notApplicableResourceCount: number = undefined;
}