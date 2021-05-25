import { JsonProperty } from '@app/utilities';

import { McsEntityBase } from '../common/mcs-entity.base';
import { McsNetworkDnsRrSets } from './mcs-network-dns-rrsets';

export class McsNetworkDnsZone extends McsEntityBase {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public ttlSeconds: number = undefined;

  @JsonProperty({ target: McsNetworkDnsRrSets })
  public rrsets: McsNetworkDnsRrSets[] = undefined;
}
