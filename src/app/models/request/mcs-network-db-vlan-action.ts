import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsMcsNetworkDbVlanActionRefObj {
    vlanId: string;
}

export class McsNetworkDbVlanAction extends McsApiJobRequestBase<IMcsMcsNetworkDbVlanActionRefObj> { }
