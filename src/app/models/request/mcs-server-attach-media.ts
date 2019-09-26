import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerAttachMediaRefObj {
  serverId: string;
}

export class McsServerAttachMedia extends McsApiJobRequestBase<IMcsServerAttachMediaRefObj> {
  @JsonProperty()
  public name: string = undefined;
}
