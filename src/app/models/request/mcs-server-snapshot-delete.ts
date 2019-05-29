import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerSnapshotDeleteRefObj {
  serverId: string;
}

export class McsServerSnapshotDelete extends McsApiJobRequestBase<IMcsServerSnapshotDeleteRefObj> { }
