import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerDetachMediaRefObj {
  serverId: string;
  mediaId: string;
}

export class McsServerDetachMedia extends McsApiJobRequestBase<IMcsServerDetachMediaRefObj> { }
