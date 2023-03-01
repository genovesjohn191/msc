import { JsonProperty } from '@app/utilities';
import { McsResourceNetworkSubnet } from './mcs-resource-network-subnet';
import { McsEntityBase } from '../common/mcs-entity.base';
import { McsResourceNetworkIpAddress } from './mcs-resource-network-ip-address';

export class McsResourceNetwork extends McsEntityBase {
  /*Used as label*/
  @JsonProperty()
  public networkName : string = undefined;

  /*Used as value*/
  @JsonProperty()
  public name : string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public vlanNumber: number = undefined;

  @JsonProperty({ target: McsResourceNetworkIpAddress })
  public ipAddresses: McsResourceNetworkIpAddress[] = undefined;

  @JsonProperty({ target: McsResourceNetworkSubnet })
  public subnets: McsResourceNetworkSubnet[] = undefined;
}
