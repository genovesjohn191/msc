import { JsonProperty } from '@app/utilities';

import { McsNetworkDnsRrSetsRecord } from './mcs-network-dns-rrsets-record';

export class McsNetworkDnsRrSets {
  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public type: string = undefined;

  @JsonProperty()
  public class: string = undefined;

  @JsonProperty()
  public ttlSeconds: number = undefined;

  @JsonProperty({ target: McsNetworkDnsRrSetsRecord })
  public records: McsNetworkDnsRrSetsRecord[] = undefined;
}
