import { JsonProperty } from '@app/utilities';

import { McsNetworkDnsBase } from './mcs-network-dns-base';
import { McsNetworkDnsZone } from './mcs-network-dns-zone';

export class McsNetworkDnsSummary extends McsNetworkDnsBase {
  @JsonProperty({ target: McsNetworkDnsZone })
  public zones: McsNetworkDnsZone[] = undefined;

  public get zoneCount(): number {
    return this.zones?.length || 0;
  }
}
