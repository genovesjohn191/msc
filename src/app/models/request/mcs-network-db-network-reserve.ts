import { JsonProperty } from '@app/utilities';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsNetworkDbNetworkReserveRefObj {
    networkId: string;
}

export class McsNetworkDbNetworkReserve extends McsApiJobRequestBase<IMcsNetworkDbNetworkReserveRefObj> {
    @JsonProperty()
    public pods: number[] = undefined;

    @JsonProperty()
    public isMazaa: boolean = undefined;
}
