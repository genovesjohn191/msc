import { JsonProperty } from '@app/utilities';

export class McsNetworkVdcSubnet {
  @JsonProperty()
  public gatewayIp: string = undefined;

  @JsonProperty()
  public prefixLength : number = undefined;

  @JsonProperty()
  public description : string = undefined;

}