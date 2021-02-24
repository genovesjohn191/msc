import { JsonProperty } from '@app/utilities';
import { McsNetworkDnsBase } from './mcs-network-dns-base';
import { McsNetworkDnsZone } from './mcs-network-dns-zone';

export class McsNetworkDnsSummary extends McsNetworkDnsBase {

    @JsonProperty()
    public zones: Array<McsNetworkDnsZone> = undefined;

}
