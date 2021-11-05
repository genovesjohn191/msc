import { JsonProperty } from '@app/utilities';

export class McsReportComputeResourceTotals {
  @JsonProperty()
  public serverCount: number = undefined;

  @JsonProperty()
  public resourceCount: number = undefined;

  @JsonProperty()
  public firewallCount: number = undefined;
}
