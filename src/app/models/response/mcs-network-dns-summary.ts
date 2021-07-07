import { JsonProperty } from '@app/utilities';

import { McsNetworkDnsBase } from './mcs-network-dns-base';
import { McsNetworkDnsZone } from './mcs-network-dns-zone';

export class McsNetworkDnsSummary extends McsNetworkDnsBase {
  @JsonProperty({ target: McsNetworkDnsZone })
  public zones: McsNetworkDnsZone[] = undefined;

  // TODO(apascual): Temporarily display this field in the ui
  // since API still adding the zoneCount field in the dns details endpoint.
  // If completed, remove this field and find the associated html element using it.
  public get zoneCountTmp(): number {
    return this.zones?.length || 0;
  }
}
