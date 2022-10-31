import { JsonProperty } from '@app/utilities';

import { McsNetworkDnsRrSets } from './mcs-network-dns-rrsets';
import { McsNetworkDnsZoneBase } from './mcs-network-dns-zone-base';

export class McsNetworkDnsZone extends McsNetworkDnsZoneBase {
  @JsonProperty({ target: McsNetworkDnsRrSets })
  public rrsets: McsNetworkDnsRrSets[] = undefined;
}
