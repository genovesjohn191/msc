import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerOsUpdatesRequestRefObj {
  serverId: string;
}

export class McsServerOsUpdatesRequest extends McsApiJobRequestBase<IMcsServerOsUpdatesRequestRefObj> {
  public category: string[] = undefined;
  public updates: string[] = undefined;
}
