import { JsonProperty } from '@peerlancers/json-serialization';
import { McsResourceNetworkIpAddress } from './mcs-resource-network-ip-address';
import { McsEntityBase } from '../common/mcs-entity.base';

export class McsResourceNetwork extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty()
  public vlanId: number = undefined;

  @JsonProperty()
  public netmask: string = undefined;

  @JsonProperty()
  public gateway: string = undefined;

  @JsonProperty({ target: McsResourceNetworkIpAddress })
  public ipAddresses: McsResourceNetworkIpAddress[] = undefined;
}
