import { JsonProperty } from 'json-object-mapper';
import { McsResourceNetworkIpAddress } from './mcs-resource-network-ip-address';
import { McsEntityBase } from '../mcs-entity.base';

export class McsResourceNetwork extends McsEntityBase {
  public name: string;
  public serviceId: string;
  public vlanId: number;
  public netmask: string;
  public gateway: string;

  @JsonProperty({ type: McsResourceNetworkIpAddress })
  public ipAddresses: McsResourceNetworkIpAddress[];

  constructor() {
    super();
    this.name = undefined;
    this.serviceId = undefined;
    this.vlanId = undefined;
    this.netmask = undefined;
    this.gateway = undefined;
    this.ipAddresses = undefined;
  }
}
