import { JsonProperty } from 'json-object-mapper';
import { ServerNetworkIpAddress } from './server-network-ip-address';

export class ServerNetwork {
  public id: string;
  public name: string;
  public serviceId: string;
  public vlanId: number;
  public netmask: string;
  public gateway: string;

  @JsonProperty({ type: ServerNetworkIpAddress })
  public ipAddresses: ServerNetworkIpAddress[];

  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.serviceId = undefined;
    this.vlanId = undefined;
    this.netmask = undefined;
    this.gateway = undefined;
    this.ipAddresses = undefined;
  }
}
