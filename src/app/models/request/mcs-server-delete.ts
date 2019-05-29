import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerDeleteRefObj {
  serverId: string;
  isDeleting: boolean;
}

export class McsServerDelete extends McsApiJobRequestBase<IMcsServerDeleteRefObj> { }
