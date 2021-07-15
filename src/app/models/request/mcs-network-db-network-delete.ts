import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsNetworkDbNetworkDeleteRefObj {
    networkId: string;
}

export class McsNetworkDbNetworkDelete extends McsApiJobRequestBase<IMcsNetworkDbNetworkDeleteRefObj> { }
