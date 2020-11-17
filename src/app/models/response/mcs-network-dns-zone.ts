import { JsonProperty } from '@app/utilities';
import { McsNetworkDnsBase } from './mcs-network-dns-base';
import { McsNetworkDnsRrSets } from './mcs-network-dns-rrsets';

export class McsNetworkDnsZone extends McsNetworkDnsBase {

    @JsonProperty()
    public id: string = undefined;

    @JsonProperty()
    public serviceId: string = undefined;

    @JsonProperty()
    public name: string = undefined;

    @JsonProperty()
    public ttlSeconds: number = undefined;

    @JsonProperty()
    public rrsets: Array<McsNetworkDnsRrSets> = undefined;

}
