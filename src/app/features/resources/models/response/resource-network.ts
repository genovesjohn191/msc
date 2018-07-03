import { JsonProperty } from 'json-object-mapper';
import { ResourceNetworkIpAddress } from './resource-network-ip-address';
import { McsEntityBase } from '../../../../core';

export class ResourceNetwork extends McsEntityBase {
  public name: string;
  public serviceId: string;
  public vlanId: number;
  public netmask: string;
  public gateway: string;

  @JsonProperty({ type: ResourceNetworkIpAddress })
  public ipAddresses: ResourceNetworkIpAddress[];

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
