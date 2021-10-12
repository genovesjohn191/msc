import { JsonProperty } from '@app/utilities';
import { McsNetworkVdcSubnet } from './mcs-network-vdc-subnet';

export class McsNetworkVdcPrecheckVlan {
  @JsonProperty()
  public vlanId: string = undefined;

  @JsonProperty({ target: McsNetworkVdcSubnet })
  public subnets: McsNetworkVdcSubnet[] = [];
}