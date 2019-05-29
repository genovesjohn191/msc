import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerSnapshotRestoreRefObj {
  serverId: string;
}

export class McsServerSnapshotRestore extends McsApiJobRequestBase<IMcsServerSnapshotRestoreRefObj> { }
