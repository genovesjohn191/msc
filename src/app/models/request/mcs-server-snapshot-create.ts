import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerSnapshotCreateRefObj {
  serverId: string;
}

export class McsServerSnapshotCreate extends McsApiJobRequestBase<IMcsServerSnapshotCreateRefObj> {
  public preserveMemory: boolean = undefined;
  public preserveState: boolean = undefined;
}
