import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerAttachMediaRefObj {
  serverId: string;
}

export class McsServerAttachMedia extends McsApiJobRequestBase<IMcsServerAttachMediaRefObj> {
  public name: string = undefined;
}
