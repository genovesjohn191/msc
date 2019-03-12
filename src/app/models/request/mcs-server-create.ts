import { JsonProperty } from 'json-object-mapper';
import { McsServerCreateStorage } from './mcs-server-create-storage';
import { McsServerCreateNic } from './mcs-server-create-nic';
import { McsApiJobRequestBase } from '../common/mcs-api-job-request-base';
import { McsServerCreateOs } from './mcs-server-create-os';

export class McsServerCreate extends McsApiJobRequestBase {
  public platform: string;
  public inviewLevel: string;
  public resource: string;
  public name: string;
  public cpuCount: number;
  public memoryMB: number;
  public image: string;
  public target: string;
  public serviceId: string;

  @JsonProperty({ type: McsServerCreateOs })
  public os: McsServerCreateOs;

  @JsonProperty({ type: McsServerCreateStorage })
  public storage: McsServerCreateStorage;

  @JsonProperty({ type: McsServerCreateNic })
  public network: McsServerCreateNic;

  constructor() {
    super();
    this.platform = undefined;
    this.inviewLevel = undefined;
    this.resource = undefined;
    this.name = undefined;
    this.cpuCount = undefined;
    this.memoryMB = undefined;
    this.image = undefined;
    this.target = undefined;
    this.serviceId = undefined;
    this.os = undefined;
    this.storage = undefined;
    this.network = undefined;
  }
}
