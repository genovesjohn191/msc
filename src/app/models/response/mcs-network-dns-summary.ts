import { JsonProperty } from '@app/utilities';
import { McsNetworkDnsBase } from './mcs-network-dns-base';

export class McsNetworkDnsSummary extends McsNetworkDnsBase {
  @JsonProperty()
  public zoneCount: number = undefined;
}
