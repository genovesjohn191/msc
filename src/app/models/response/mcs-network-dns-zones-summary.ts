import { JsonProperty } from '@app/utilities';
import { McsNetworkDnsBase } from './mcs-network-dns-base';
import { McsNetworkDnsZone } from './mcs-network-dns-zone';

export class McsNetworkDnsZonesSummary extends McsNetworkDnsBase {

    @JsonProperty()
    public id: string = undefined;

    @JsonProperty()
    public serviceId: string = undefined;

    @JsonProperty()
    public zones: Array<McsNetworkDnsZone> = undefined;

}
