import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface McsServerRenameRefObj {
  serverId: string;
}

export class McsServerRename extends McsApiJobRequestBase<McsServerRenameRefObj> {
  @JsonProperty()
  public name: string = undefined;
}
