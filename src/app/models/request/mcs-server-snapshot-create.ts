import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerSnapshotCreateRefObj {
  serverId: string;
}

export class McsServerSnapshotCreate extends McsApiJobRequestBase<IMcsServerSnapshotCreateRefObj> {
  @JsonProperty()
  public preserveMemory: boolean = undefined;

  @JsonProperty()
  public preserveState: boolean = undefined;
}
