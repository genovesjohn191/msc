import { JsonProperty } from '@app/utilities';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsNetworkDbNetworkUpdateRefObj {
    networkId: string;
}

export class McsNetworkDbNetworkUpdate extends McsApiJobRequestBase<IMcsNetworkDbNetworkUpdateRefObj> {
    @JsonProperty()
    public companyId: string = undefined;

    @JsonProperty()
    public name: string = undefined;

    @JsonProperty()
    public serviceId: string = undefined;

    @JsonProperty()
    public description: string = undefined;

    @JsonProperty()
    public useCaseId: number = undefined;
}
