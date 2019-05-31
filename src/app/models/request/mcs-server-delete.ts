import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerDeleteRefObj {
  serverId: string;
}

export class McsServerDelete extends McsApiJobRequestBase<IMcsServerDeleteRefObj> { }
