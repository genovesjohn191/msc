import { JsonProperty } from '@peerlancers/json-serialization';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';

export interface IMcsServerOsUpdatesRequestRefObj {
  serverId: string;
}

export class McsServerOsUpdatesRequest extends McsApiJobRequestBase<IMcsServerOsUpdatesRequestRefObj> {
  @JsonProperty()
  public category: string[] = undefined;

  @JsonProperty()
  public updates: string[] = undefined;

  @JsonProperty()
  public snapshot: boolean = undefined;

  @JsonProperty()
  public deleteExistingSnapshot?: boolean = undefined;
}
