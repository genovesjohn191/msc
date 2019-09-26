import { JsonProperty } from '@peerlancers/json-serialization';
import { McsServerCreateStorage } from './mcs-server-create-storage';
import { McsServerCreateNic } from './mcs-server-create-nic';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import { McsServerCreateOs } from './mcs-server-create-os';

export class McsServerCreate extends McsApiJobRequestBase<any> {
  @JsonProperty()
  public platform: string = undefined;

  @JsonProperty()
  public inviewLevel: string = undefined;

  @JsonProperty()
  public resource: string = undefined;

  @JsonProperty()
  public name: string = undefined;

  @JsonProperty()
  public cpuCount: number = undefined;

  @JsonProperty()
  public memoryMB: number = undefined;

  @JsonProperty()
  public image: string = undefined;

  @JsonProperty()
  public target: string = undefined;

  @JsonProperty()
  public serviceId: string = undefined;

  @JsonProperty({ target: McsServerCreateOs })
  public os: McsServerCreateOs = undefined;

  @JsonProperty({ target: McsServerCreateStorage })
  public storage: McsServerCreateStorage = undefined;

  @JsonProperty({ target: McsServerCreateNic })
  public network: McsServerCreateNic = undefined;
}
