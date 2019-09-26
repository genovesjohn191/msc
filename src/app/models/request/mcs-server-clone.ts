import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerCloneRefObj {
  serverId: string;
}

export class McsServerClone extends McsApiJobRequestBase<IMcsServerCloneRefObj> {
  @JsonProperty()
  public name: string = undefined;
  public serverId: string = undefined;
}
